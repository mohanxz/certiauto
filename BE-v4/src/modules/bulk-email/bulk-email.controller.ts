import { Request, Response } from "express";
import * as bulkService from "./bulk-email.service";
import { sendResponse } from "../utils/response.util";
import { startProcessor } from "./bulk-email.processor";

export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const job = await bulkService.createJob(req.body, userId);
    startProcessor(); // Trigger background processing
    sendResponse(res, 201, true, job, "Bulk Email Job Created");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const result = await bulkService.getJobs(req.query);
    sendResponse(
      res,
      200,
      true,
      result.data,
      "Jobs fetched successfully",
      result.pagination,
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getJobDetails = async (req: Request, res: Response) => {
  try {
    const job = await bulkService.getJobById(req.params.id as string);
    if (!job) return sendResponse(res, 404, false, null, "Job not found");
    sendResponse(res, 200, true, job, "Job details fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const retryJob = async (req: Request, res: Response) => {
  try {
    const job = await bulkService.retryJob(req.params.id as string);
    startProcessor(); // Trigger background processing
    sendResponse(res, 200, true, job, "Job retry initiated");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const retryJobItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const studentId = req.params.studentId as string;
    const result = await bulkService.retrySingleRecipient(id, studentId);

    if (result) {
      startProcessor(); // Trigger background immediately
      sendResponse(res, 200, true, null, "Recipient retry queued");
    } else {
      sendResponse(
        res,
        400,
        false,
        null,
        "Recipient is not in FAILED status or not found",
      );
    }
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
