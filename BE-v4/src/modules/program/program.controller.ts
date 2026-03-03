import { Request, Response } from "express";
import * as programService from "./program.service";
import { sendResponse } from "../utils/response.util";

export const createProgram = async (req: Request, res: Response) => {
  try {
    const { programName, description } = req.body;

    const createdBy = (req as any).user?.id;

    if (!createdBy) {
      sendResponse(res, 401, false, null, "Unauthorized");
      return;
    }

    const newProgram = await programService.createProgram({
      programName,
      description,
      createdBy,
    });
    sendResponse(res, 201, true, newProgram, "Program created successfully");
  } catch (error: any) {
    if (error.code === 11000) {
      sendResponse(
        res,
        400,
        false,
        null,
        "Program with this name already exists",
      );
    } else {
      sendResponse(res, 500, false, null, error.message);
    }
  }
};

export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await programService.getAllPrograms();
    sendResponse(res, 200, true, programs, "Programs fetched successfully");
  } catch (error: any) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const getProgramById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const program = await programService.getProgramById(id);
    if (!program) {
      sendResponse(res, 404, false, null, "Program not found");
      return;
    }
    sendResponse(res, 200, true, program, "Program fetched successfully");
  } catch (error: any) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updatedProgram = await programService.updateProgram(id, req.body);
    if (!updatedProgram) {
      sendResponse(res, 404, false, null, "Program not found");
      return;
    }
    sendResponse(
      res,
      200,
      true,
      updatedProgram,
      "Program updated successfully",
    );
  } catch (error: any) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deletedProgram = await programService.deleteProgram(id);
    if (!deletedProgram) {
      sendResponse(res, 404, false, null, "Program not found");
      return;
    }
    sendResponse(res, 200, true, null, "Program deleted successfully");
  } catch (error: any) {
    sendResponse(res, 500, false, null, error.message);
  }
};
