import { Router } from "express";
import { verifyCertificateController } from "./certificate-verification.controller";

const router = Router();

router.get("/verify/:certificateId", verifyCertificateController);

export default router;