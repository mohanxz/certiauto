import { Request, Response } from "express";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";
import BulkUpload, { BulkUploadStatus } from "./bulk-upload.model";
import { sendResponse } from "../../utils/response.util";
import { processBulkUploads } from "../../../cron";

// 1. Download Template
export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const headers = [
      "uniqueId",
      "name",
      "email",
      "phoneNumber",
      "address",
      "finalMark",
      "date", // Completion Date (YYYY-MM-DD)
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([headers]);
    xlsx.utils.book_append_sheet(wb, ws, "Template");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Student_Upload_Template.xlsx"',
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// 2. Upload File (Create Job)
export const uploadBulkFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, null, "No file uploaded");
    }

    const userId = (req as any).user.id;
    const { batchId, courseIds } = req.body;

    const bulkJob = new BulkUpload({
      fileName: req.file.originalname,
      filePath: req.file.path,
      status: BulkUploadStatus.PENDING,
      targetBatchId: batchId,
      targetCourseIds: courseIds ? courseIds.split(",") : [],
      createdBy: userId,
    });

    await bulkJob.save();

    // Trigger processing immediately in background
    processBulkUploads();

    sendResponse(
      res,
      201,
      true,
      bulkJob,
      "File uploaded and job created successfully. Processing started.",
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// 3. Get Upload History
export const getUploadHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { status, startDate, endDate } = req.query;

    const filter: any = { createdBy: userId };

    // Status Filter
    if (status) {
      filter.status = status;
    }

    // Date Range Filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        // Set end date to end of day if just date provided, or parse as is
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const uploads = await BulkUpload.find(filter)
      .sort({ createdAt: -1 })
      .select("-logs") // Exclude logs for list view to save bandwidth
      .skip(skip)
      .limit(limit);

    const total = await BulkUpload.countDocuments(filter);

    sendResponse(
      res,
      200,
      true,
      uploads,
      "Upload history fetched successfully",
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// 4. Get Job Details
export const getUploadJobDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const jobId = req.params.id;

    const job = await BulkUpload.findOne({ _id: jobId, createdBy: userId });

    if (!job) {
      return sendResponse(res, 404, false, null, "Job not found");
    }

    sendResponse(res, 200, true, job, "Job details fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
