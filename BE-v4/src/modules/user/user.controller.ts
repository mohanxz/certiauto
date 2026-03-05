import { Request, Response } from "express";
import * as userService from "./user.service";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response.util";

export const login = async (req: Request, res: Response) => {
  console.log("DEBUG: Login Request Body:", req.body);

  if (!req.body) {
    return sendResponse(
      res,
      400,
      false,
      null,
      "Invalid request body. Ensure Content-Type is application/json",
    );
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(
      res,
      400,
      false,
      null,
      "Email and password are required",
    );
  }

  try {
    // Find user
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return sendResponse(res, 401, false, null, "Invalid email or password");
    }

    // Validate password
    const isPasswordValid = await userService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return sendResponse(res, 401, false, null, "Invalid email or password");
    }

    // Check JWT Secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is missing in environment variables");
      return sendResponse(
        res,
        500,
        false,
        null,
        "Server configuration error: JWT secret missing",
      );
    }

    // Generate Token
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "1h" });

    // Send response
    return sendResponse(res, 200, true, {
      _id: user._id,
      name: user.name,
      age: user.age,
      address: user.address,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return sendResponse(res, 500, false, null, (error as Error).message);
  }
};
