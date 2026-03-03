import { Request, Response } from "express";
import * as service from "./certificate-download.service";

/**
 * 🔹 Download certificate for ONE student (PDF)
 */
export const downloadIndividualCertificate = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.params.studentId as string;
    const { certificateTemplateId } = req.body;

    if (!studentId || !certificateTemplateId) {
      return res.status(400).json({
        success: false,
        message: "studentId and certificateTemplateId are required",
      });
    }

    // ✅ CALL CORRECT SERVICE FUNCTION
    await service.downloadSingleCertificate(
      studentId,
      certificateTemplateId,
      res
    );

  } catch (error) {
    console.error("Individual download error:", error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * 🔹 Download certificates for MULTIPLE students (ZIP)
 */
export const downloadBulkCertificates = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentIds, certificateTemplateId } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be a non-empty array",
      });
    }

    await service.generateBulkCertificatesZip(
      studentIds,
      certificateTemplateId,
      res
    );

  } catch (error) {
    console.error("Bulk download error:", error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};