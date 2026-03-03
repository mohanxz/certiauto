import express from "express";
import userRoutes from "./modules/user/user.routes";
import courseRoutes from "./modules/course/course.routes";
import batchRoutes from "./modules/batch/batch.routes";
import studentRoutes from "./modules/student/student.routes";
import bulkUploadRoutes from "./modules/student/bulk-upload/bulk-upload.routes";
import mailTemplateRoutes from "./modules/mailtemplate/mailtemplate.routes";
import mailLogRoutes from "./modules/maillog/maillog.routes";
import bulkEmailRoutes from "./modules/bulk-email/bulk-email.routes";
import programRoutes from "./modules/program/program.routes";
import certificateTemplateRoutes from "./modules/certificate-template/certificate-template.routes";

const router = express.Router();

router.use("/program", programRoutes);
router.use("/user", userRoutes);
router.use("/course", courseRoutes);
router.use("/batch", batchRoutes);
router.use("/student", studentRoutes);
router.use("/bulk-upload", bulkUploadRoutes);
router.use("/mailtemplate", mailTemplateRoutes);
router.use("/maillog", mailLogRoutes);
router.use("/bulk-email", bulkEmailRoutes);
router.use("/certificate-template", certificateTemplateRoutes);

export default router;
