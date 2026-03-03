import archiver from "archiver";
import { Response } from "express";
import Student from "../student/student.model";
import CertificateTemplate from "../certificate-template/certificate-template.model";
import {
  generatePdfFromWord,
  prepareCertificateData,
} from "../../services/pdf.service";

/**
 * =====================================================
 * SINGLE CERTIFICATE DOWNLOAD
 * =====================================================
 */
export const downloadSingleCertificate = async (
  studentId: string,
  certificateTemplateId: string,
  res: Response
) => {
  try {
    const student = await Student.findById(studentId)
      .populate("enrolledCourseIds")
      .populate("batchId");

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const template = await CertificateTemplate.findById(
      certificateTemplateId
    );

    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const courseName =
      (student.enrolledCourseIds as any)?.[0]?.courseName ||
      "Course";

    const certData = prepareCertificateData(student, courseName);

    const pdfBuffer = await generatePdfFromWord(
      template.filePath,
      certData
    );

    const safeName = student.name.replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}_${
        student.studentCode || student._id
      }.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Single Certificate Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * =====================================================
 * BULK ZIP DOWNLOAD (FAULT TOLERANT)
 * =====================================================
 */
export const generateBulkCertificatesZip = async (
  studentIds: string[],
  certificateTemplateId: string,
  res: Response
) => {
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("Archive Error:", err);
    res.status(500).send("ZIP generation failed");
  });

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="certificates.zip"'
  );
  res.setHeader("Content-Type", "application/zip");

  archive.pipe(res);

  const template = await CertificateTemplate.findById(
    certificateTemplateId
  );

  if (!template)
    throw new Error("Certificate template not found");

  for (const studentId of studentIds) {
    try {
      const student = await Student.findById(studentId)
        .populate("enrolledCourseIds")
        .populate("batchId");

      if (!student) continue;

      const courseName =
        (student.enrolledCourseIds as any)?.[0]?.courseName ||
        "Course";

      const certData = prepareCertificateData(
        student,
        courseName
      );

      const pdfBuffer = await generatePdfFromWord(
        template.filePath,
        certData
      );

      const safeName = student.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      archive.append(pdfBuffer, {
        name: `${safeName}_${
          student.studentCode || student._id
        }.pdf`,
      });

    } catch (err: any) {
      console.error(
        `Skipping student ${studentId}:`,
        err.message
      );
      continue;
    }
  }

  await archive.finalize();
};