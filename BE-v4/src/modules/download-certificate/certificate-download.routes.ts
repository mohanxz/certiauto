import express from "express";
import { protect } from "../../middleware/auth.middleware";
import {
  downloadIndividualCertificate,
  downloadBulkCertificates,
} from "./certificate-download.controller";

const router = express.Router();

console.log("🔥 certificate-download.routes LOADED");


router.post(
  "/download/:studentId",
  protect,
  downloadIndividualCertificate
);

router.post(
  "/download-bulk",
  protect,
  downloadBulkCertificates
);

export default router;
