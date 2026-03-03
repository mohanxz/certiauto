import BulkEmailJob from "./bulk-email.model";
import Student from "../student/student.model";
import { sendEmail } from "../../services/email.service";
import {
  generatePdfFromWord,
  prepareCertificateData,
} from "../../services/pdf.service";
import EmailLog from "../maillog/maillog.model";
import CertificateTemplate from "../certificate-template/certificate-template.model";
import {
  generateCourseCertificateId,
  generateInternshipCertificateId,
} from "../certificate/certificate-id.service";

export const createJob = async (data: any, userId: string) => {
  let students: any[] = [];

  if (data.studentIds?.length) {
    students = await Student.find({
      _id: { $in: data.studentIds },
    }).populate("enrolledCourseIds batchId");
  } else {
    const filter: any = {};
    if (data.batchIds?.length) filter.batchId = { $in: data.batchIds };
    if (data.courseIds?.length)
      filter.enrolledCourseIds = { $in: data.courseIds };

    students = await Student.find(filter).populate("enrolledCourseIds batchId");
  }

  if (!students.length) {
    throw new Error("No students found");
  }

  const recipients = students.map((s) => ({
    studentId: s._id,
    email: s.email,
    status: "PENDING",
  }));

  return await BulkEmailJob.create({
    title: data.title,
    type: data.type,
    subject: data.subject,
    body: data.body,
    batchIds: data.batchIds || [],
    courseIds: data.courseIds || [],
    certificateTemplateId:
      data.type === "COURSE_CERTIFICATE" ||
      data.type === "INTERNSHIP_CERTIFICATE"
        ? data.certificateTemplateId
        : null,
    senderEmailId: data.senderEmailId,
    createdBy: userId,
    recipients,
    stats: {
      total: recipients.length,
      success: 0,
      failure: 0,
    },
  });
};

export const getJobs = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await BulkEmailJob.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await BulkEmailJob.countDocuments();

  return {
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getJobById = async (id: string) => {
  return await BulkEmailJob.findById(id).populate(
    "recipients.studentId",
    "name email",
  );
};

export const retryJob = async (id: string) => {
  const job = await BulkEmailJob.findById(id);
  if (!job) throw new Error("Job not found");

  job.recipients.forEach((r) => {
    if (r.status === "FAILED") {
      r.status = "PENDING";
      r.error = undefined;
    }
  });

  job.status = "PENDING";
  return await job.save();
};

export const retrySingleRecipient = async (
  jobId: string,
  studentId: string,
) => {
  const job = await BulkEmailJob.findById(jobId);
  if (!job) throw new Error("Job not found");

  const recipient = job.recipients.find(
    (r) => r.studentId.toString() === studentId,
  );

  if (!recipient || recipient.status !== "FAILED") return false;

  recipient.status = "PENDING";
  recipient.error = undefined;
  job.status = "PENDING";

  await job.save();
  return true;
};

export const processPendingJobs = async (): Promise<boolean> => {
  const job = await BulkEmailJob.findOneAndUpdate(
    { status: "PENDING" },
    { status: "PROCESSING", startedAt: new Date() },
    { sort: { createdAt: 1 }, new: true },
  );

  if (!job) return false;

  for (const recipient of job.recipients) {
    if (recipient.status !== "PENDING") continue;

    try {
      const student = await Student.findById(recipient.studentId)
        .populate("enrolledCourseIds")
        .populate("batchId");

      if (!student) {
        throw new Error("Student not found");
      }

      const courseName =
        (student as any)?.enrolledCourseIds?.[0]?.courseName || "Course";

      const formattedDate =
        (student as any)?.completionDate
          ? new Date((student as any).completionDate).toLocaleDateString("en-GB")
          : "";

      /**
       * =====================================================
       * 🚫 SKIP STUDENTS BELOW 45 (DO NOT STOP LOOP)
       * =====================================================
       */
      const score =
        (student as any)?.finalMark ??
        (student as any)?.mark ??
        (student as any)?.percentage;

      const numericScore = Number(score);

      if (isNaN(numericScore) || numericScore < 45) {
        await BulkEmailJob.updateOne(
          {
            _id: job._id,
            "recipients.studentId": recipient.studentId,
          },
          {
            $set: {
              "recipients.$.status": "FAILED",
              "recipients.$.error": isNaN(numericScore)
                ? "Invalid or missing score"
                : "Student score below passing threshold (45)",
            },
          },
        );

        console.log(
          `🚫 Skipped ${student.name} - Score: ${numericScore}`
        );

        continue; // ✅ continues to next student
      }

      /**
       * =====================================================
       * CERTIFICATE GENERATION
       * =====================================================
       */
      let attachments: any[] = [];
      let certificateUniqueId: string | undefined;

      if (
        job.type === "COURSE_CERTIFICATE" ||
        job.type === "INTERNSHIP_CERTIFICATE"
      ) {
        const template = await CertificateTemplate.findById(
          job.certificateTemplateId,
        );

        if (!template) {
          throw new Error("Certificate template not found");
        }

        if (job.type === "COURSE_CERTIFICATE") {
          if (!(student as any).courseCertificateId) {
            (student as any).courseCertificateId =
              await generateCourseCertificateId();
            await student.save();
          }
          certificateUniqueId = (student as any).courseCertificateId;
        }

        if (job.type === "INTERNSHIP_CERTIFICATE") {
          if (!(student as any).internshipCertificateId) {
            (student as any).internshipCertificateId =
              await generateInternshipCertificateId();
            await student.save();
          }
          certificateUniqueId =
            (student as any).internshipCertificateId;
        }

        const certData = prepareCertificateData(
          student,
          courseName,
        );

        const pdfBuffer = await generatePdfFromWord(
          (template as any).filePath,
          certData,
        );

        attachments.push({
          filename: `${student.name}_Certificate.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        });
      }

      /**
       * =====================================================
       * SEND EMAIL
       * =====================================================
       */
      const variables = {
        name: student.name || "",
        course: courseName,
        date: formattedDate,
        score: numericScore.toString(),
      };

      const result = await sendEmail(
        recipient.email,
        job.subject,
        job.body,
        attachments,
        true,
        job.senderEmailId.toString(),
        variables,
      );

      await BulkEmailJob.updateOne(
        {
          _id: job._id,
          "recipients.studentId": recipient.studentId,
        },
        {
          $set: {
            "recipients.$.status": result ? "SENT" : "FAILED",
            "recipients.$.sentAt": result ? new Date() : undefined,
            "recipients.$.error": result ? undefined : "Email failed",
          },
        },
      );
    } catch (err: any) {
      await BulkEmailJob.updateOne(
        {
          _id: job._id,
          "recipients.studentId": recipient.studentId,
        },
        {
          $set: {
            "recipients.$.status": "FAILED",
            "recipients.$.error": err.message,
          },
        },
      );
    }
  }

  /**
   * =====================================================
   * RECALCULATE JOB STATS
   * =====================================================
   */
  const updatedJob = await BulkEmailJob.findById(job._id);

  if (!updatedJob) return false;

  const totalSent = updatedJob.recipients.filter(
    (r) => r.status === "SENT",
  ).length;

  const totalFailed = updatedJob.recipients.filter(
    (r) => r.status === "FAILED",
  ).length;

  updatedJob.stats.total = updatedJob.recipients.length;
  updatedJob.stats.success = totalSent;
  updatedJob.stats.failure = totalFailed;

  if (totalSent === updatedJob.recipients.length) {
    updatedJob.status = "COMPLETED";
  } else if (totalSent > 0) {
    updatedJob.status = "PARTIAL_SUCCESS";
  } else {
    updatedJob.status = "FAILED";
  }

  updatedJob.completedAt = new Date();
  await updatedJob.save();

  return true;
};

// Add to your bulk-email.service.ts
export const debugEmailSending = async (email: string) => {
  try {
    console.log("Testing email service...");
    const testSent = await sendEmail(
      email,
      "Test Email",
      "This is a test email from the bulk email system.",
      [],
      true,
    );
    console.log(`Test email ${testSent ? "sent successfully" : "failed"}`);
    return testSent;
  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
};
