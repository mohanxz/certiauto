import { Request, Response } from "express";
import * as emailService from "./email.service";
import { sendResponse } from "../utils/response.util";

// CREATE
export const createEmail = async (req: Request, res: Response) => {
  try {
    const email = await emailService.createEmail(req.body);
    sendResponse(res, 201, true, email, "Email config created successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// GET ALL
export const getEmails = async (req: Request, res: Response) => {
  try {
    const result = await emailService.getAllEmails(req.query);
    sendResponse(
      res,
      200,
      true,
      result.data,
      "Email configs fetched successfully",
      result.pagination,
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// UPDATE
export const updateEmail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const email = await emailService.updateEmail(id, req.body);
    sendResponse(res, 200, true, email, "Email config updated successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// ACTIVATE
export const activateEmail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const email = await emailService.activateEmail(id);
    sendResponse(res, 200, true, email, "Email activated successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

// DELETE
export const deleteEmail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await emailService.deleteEmail(id);
    sendResponse(res, 200, true, null, "Email config deleted successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
