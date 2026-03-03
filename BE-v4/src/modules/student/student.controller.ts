import { Request, Response } from "express";
import * as studentService from "./student.service";
import { sendResponse } from "../utils/response.util";
import {
  generatePdfFromWord,
  prepareCertificateData,
} from "../../services/pdf.service";
import { sendEmail } from "../../services/email.service";
import EmailLog from "../maillog/maillog.model";

/* ================= CREATE STUDENT ================= */
export const createStudent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const student = await studentService.createStudent(req.body, userId);
    sendResponse(res, 201, true, student, "Student created successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

/* ================= GET ALL STUDENTS ================= */
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const result = await studentService.getAllStudents(req.query);
    sendResponse(
      res,
      200,
      true,
      result.data,
      "Students fetched successfully",
      result.pagination,
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

/* ================= GET STUDENT BY ID ================= */
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return sendResponse(res, 400, false, null, "Student id is required");
    }

    const student = await studentService.getStudentById(id);

    if (!student) {
      return sendResponse(res, 404, false, null, "Student not found");
    }

    sendResponse(res, 200, true, student, "Student fetched successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

/* ================= UPDATE STUDENT ================= */
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return sendResponse(res, 400, false, null, "Student id is required");
    }

    const student = await studentService.updateStudent(id, req.body);

    if (!student) {
      return sendResponse(res, 404, false, null, "Student not found");
    }

    sendResponse(res, 200, true, student, "Student updated successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

/* ================= SEND CERTIFICATE ================= */
/* ================= SEND CERTIFICATE ================= */
export const sendCertificate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return sendResponse(res, 400, false, null, "Student id is required");
    }

    const { subject, body, certificateTemplateId } = req.body;
    const senderEmailId = req.body.senderEmailId as string | undefined;

    const student = await studentService.getStudentById(id);
    if (!student) {
      return sendResponse(res, 404, false, null, "Student not found");
    }

    const studentName = student.name;
    const courseName = (student.enrolledCourseIds as any[])?.[0]?.courseName || "Course";
    const batchName = (student.batchId as any)?.batchName || "Batch";
    const date = new Date().toLocaleDateString();

    let finalSubject = subject || `Course Completion Certificate - ${courseName}`;
    let finalBody = body || `Dear ${studentName},<br><br>Congratulations on completing ${courseName}.`;

    const variables: Record<string, string> = {
      "{name}": studentName,
      "{course}": courseName,
      "{batch}": batchName,
      "{date}": date,
    };

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(key, "g");
      finalSubject = finalSubject.replace(regex, variables[key]);
      finalBody = finalBody.replace(regex, variables[key]);
    });

    const CertificateTemplate = require("../certificate-template/certificate-template.model").default;
    const template = certificateTemplateId 
      ? await CertificateTemplate.findById(certificateTemplateId) 
      : await CertificateTemplate.findOne().sort({ createdAt: -1 });

    if (!template) {
      return sendResponse(
        res, 
        400, 
        false, 
        null, 
        "No Certificate Template found",
      );
    }

    const pdfBuffer = await generatePdfFromWord(
      template.filePath, 
      prepareCertificateData(student, courseName, date)
    );

    // FIX: Remove the senderEmailId argument (the 6th argument)
    // Change this line (around line 143):
    const emailSent = await sendEmail(
      student.email, 
      finalSubject, 
      finalBody,
      [{ 
        filename: `${studentName}_Certificate.pdf`, 
        content: pdfBuffer, 
        contentType: "application/pdf" 
      }],
      true // isHtml
      // REMOVED: senderEmailId (this was the 6th argument causing the error)
    );

    await EmailLog.create({
      recipient: student.email,
      subject: finalSubject,
      type: "CERTIFICATE",
      status: emailSent ? "SUCCESS" : "FAILED",
      studentId: student._id,
    });

    sendResponse(
      res, 
      emailSent ? 200 : 500, 
      emailSent, 
      null, 
      emailSent ? "Certificate sent successfully" : "Failed to send certificate"
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

/* ================= SEND NORMAL EMAIL ================= */
export const sendEmailToStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return sendResponse(res, 400, false, null, "Student id is required");
    }

    const { subject, body } = req.body;
    const senderEmailId = req.body.senderEmailId as string | undefined;

    const student = await studentService.getStudentById(id);

    if (!student) {
      return sendResponse(res, 404, false, null, "Student not found");
    }

    let finalSubject = subject;
    let finalBody = body;

    const variables: Record<string, string> = {
      "{name}": student.name,
      "{email}": student.email,
      "{batch}": (student.batchId as any)?.batchName || "",
    };

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(key, "gi");
      finalSubject = finalSubject.replace(regex, variables[key]);
      finalBody = finalBody.replace(regex, variables[key]);
    });

    const emailSent = await sendEmail(
      student.email,
      finalSubject,
      finalBody,
      [],
      true,
      senderEmailId,
    );

    await EmailLog.create({
      recipient: student.email,
      subject: finalSubject,
      type: "EMAIL",
      status: emailSent ? "SUCCESS" : "FAILED",
      studentId: student._id,
    });

    sendResponse(
      res,
      emailSent ? 200 : 500,
      emailSent,
      null,
      emailSent ? "Email sent successfully" : "Failed to send email",
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};

/* ================= DELETE STUDENT ================= */
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return sendResponse(res, 400, false, null, "Student id is required");
    }

    const student = await studentService.deleteStudent(id);

    if (!student) {
      return sendResponse(res, 404, false, null, "Student not found");
    }

    sendResponse(res, 200, true, null, "Student deleted successfully");
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};
// In your student.controller.ts, add this function and make sure it's exported

/* ================= DELETE ALL STUDENTS ================= */
export const deleteAllStudents = async (req: Request, res: Response) => {
  try {
    const result = await studentService.deleteAllStudents();
    sendResponse(
      res, 
      200, 
      true, 
      { deletedCount: result.deletedCount }, 
      `${result.deletedCount} students deleted successfully`
    );
  } catch (error) {
    sendResponse(res, 500, false, null, (error as Error).message);
  }
};