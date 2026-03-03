import { Request, Response } from "express";
import { verifyCertificate } from "./certificate-verification.service";

export const verifyCertificateController = async (
  req: Request,
  res: Response
) => {
  try {
    const param = req.params.certificateId;

    // 🔥 Ensure it is always a string
    if (!param || Array.isArray(param)) {
      return res.status(400).json({
        valid: false,
        message: "Invalid Certificate ID"
      });
    }

    const result = await verifyCertificate(param);

    if (!result.valid) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  } catch (error: any) {
    return res.status(500).json({
      valid: false,
      message: error.message
    });
  }
};