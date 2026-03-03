import { Request, Response } from "express";
import * as templateService from "./mailtemplate.service";
import { sendResponse } from "../utils/response.util";

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const template = await templateService.createTemplate(req.body);
    sendResponse(res, 201, true, template, "Template created successfully");
  } catch (error) {
    if ((error as any).code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Template name already exists",
      );
    }
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await templateService.getAllTemplates();
    sendResponse(res, 200, true, templates, "Templates fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await templateService.getTemplateById(
      req.params.id as string,
    );
    if (!template) {
      return sendResponse(res, 404, false, null, "Template not found");
    }
    sendResponse(res, 200, true, template, "Template fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const template = await templateService.updateTemplate(
      req.params.id as string,
      req.body,
    );
    if (!template) {
      return sendResponse(res, 404, false, null, "Template not found");
    }
    sendResponse(res, 200, true, template, "Template updated successfully");
  } catch (error) {
    if ((error as any).code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Template name already exists",
      );
    }
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const template = await templateService.deleteTemplate(
      req.params.id as string,
    );
    if (!template) {
      return sendResponse(res, 404, false, null, "Template not found");
    }
    sendResponse(res, 200, true, null, "Template deleted successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
