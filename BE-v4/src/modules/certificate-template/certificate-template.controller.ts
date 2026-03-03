import { Request, Response } from "express";
import CertificateTemplate from "./certificate-template.model";
import { sendResponse } from "../utils/response.util";
import fs from "fs";
import path from "path";

export const uploadTemplate = async (req: Request, res: Response) => {
  try {
    console.log("Upload Template Request Body:", req.body);
    console.log("Upload Template Request File:", req.file);

    const file = req.file;
    const { name, description } = req.body;

    console.log("User from Request:", (req as any).user);
    const userObj = (req as any).user;
    const userId = userObj ? userObj.userId || userObj.id || userObj._id : null;

    if (!userId) {
      console.error("User ID not found in request");
      return sendResponse(res, 401, false, "Unauthorized: User ID missing");
    }

    if (!file) {
      console.error("No file in request");
      return sendResponse(res, 400, false, "No file uploaded");
    }

    const template = await CertificateTemplate.create({
      name,
      description,
      filePath: file.path,
      originalName: file.originalname,
      createdBy: userId,
    });

    console.log("Template created:", template);
    return sendResponse(
      res,
      201,
      true,
      template,
      "Template uploaded successfully",
    );
  } catch (error) {
    console.error("Upload Template Error:", error);
    return sendResponse(res, 500, false, error, "Error uploading template");
  }
};

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await CertificateTemplate.find({ isDeleted: false }).sort(
      { createdAt: -1 },
    );
    return sendResponse(
      res,
      200,
      true,
      templates,
      "Templates fetched successfully",
    );
  } catch (error) {
    return sendResponse(res, 500, false, error, "Error fetching templates");
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await CertificateTemplate.findById(id);

    if (!template) {
      return sendResponse(res, 404, false, null, "Template not found");
    }

    // Soft delete
    template.isDeleted = true;
    await template.save();

    return sendResponse(res, 200, true, null, "Template deleted successfully");
  } catch (error) {
    return sendResponse(res, 500, false, error, "Error deleting template");
  }
};
