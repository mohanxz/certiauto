import { Request, Response } from "express";
import * as courseService from "./course.service";
import { sendResponse } from "../utils/response.util";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const course = await courseService.createCourse(req.body, userId);
    sendResponse(res, 201, true, course, "Course created successfully");
  } catch (error) {
    // Handle unique constraint error
    if ((error as any).code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Course name already exists in this batch",
      );
    }
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const result = await courseService.getAllCourses(req.query);
    sendResponse(
      res,
      200,
      true,
      result.data,
      "Courses fetched successfully",
      result.pagination,
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await courseService.getCourseById(req.params.id as string);
    if (!course) {
      return sendResponse(res, 404, false, null, "Course not found");
    }
    sendResponse(res, 200, true, course, "Course fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id as string,
      req.body,
    );
    if (!course) {
      return sendResponse(res, 404, false, null, "Course not found");
    }
    sendResponse(res, 200, true, course, "Course updated successfully");
  } catch (error) {
    if ((error as any).code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Course name already exists in this batch",
      );
    }
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await courseService.deleteCourse(req.params.id as string);
    if (!course) {
      return sendResponse(res, 404, false, null, "Course not found");
    }
    sendResponse(res, 200, true, null, "Course deleted successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
