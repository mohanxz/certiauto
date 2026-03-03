import { Request, Response } from "express";
import * as mailLogService from "./maillog.service";
import { sendResponse } from "../utils/response.util";

export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (end < start) {
        return sendResponse(
          res,
          400,
          false,
          null,
          "End date cannot be smaller than Start date",
        );
      }
    }

    const result = await mailLogService.getEmailLogs(req.query);
    sendResponse(
      res,
      200,
      true,
      result.data,
      "Email logs fetched successfully",
      result.pagination,
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
