import { Request, Response } from "express";
import * as batchService from "./batch.service";
import { sendResponse } from "../utils/response.util";

export const createBatch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { startTime, endTime } = req.body;

    // Validation for HH:mm string format?
    // Simple string comparison works for HH:mm (24h)
    if (startTime && endTime) {
      if (startTime >= endTime) {
        return sendResponse(
          res,
          400,
          false,
          null,
          "End time must be greater than Start time",
        );
      }
    }

    const batch = await batchService.createBatch(req.body, userId);
    sendResponse(res, 201, true, batch, "Batch created successfully");
  } catch (error) {
    if ((error as any).code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Batch name already exists for this program",
      );
    }
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getAllBatches = async (req: Request, res: Response) => {
  try {
    const result = await batchService.getAllBatches(req.query);
    sendResponse(
      res,
      200,
      true,
      result.data,
      "Batches fetched successfully",
      result.pagination,
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getBatchById = async (req: Request, res: Response) => {
  try {
    const batch = await batchService.getBatchById(req.params.id as string);
    if (!batch) {
      return sendResponse(res, 404, false, null, "Batch not found");
    }
    sendResponse(res, 200, true, batch, "Batch fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const { startTime, endTime } = req.body;
    if (startTime && endTime) {
      if (startTime >= endTime) {
        return sendResponse(
          res,
          400,
          false,
          null,
          "End time must be greater than Start time",
        );
      }
    }

    const batch = await batchService.updateBatch(
      req.params.id as string,
      req.body,
    );
    if (!batch) {
      return sendResponse(res, 404, false, null, "Batch not found");
    }
    sendResponse(res, 200, true, batch, "Batch updated successfully");
  } catch (error) {
    if ((error as any).code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Batch name already exists for this program",
      );
    }
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const batch = await batchService.deleteBatch(req.params.id as string);
    if (!batch) {
      return sendResponse(res, 404, false, null, "Batch not found");
    }
    sendResponse(res, 200, true, null, "Batch deleted successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
