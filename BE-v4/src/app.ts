import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import routes from "./routes.config";
import certificateDownloadRoutes from "./modules/download-certificate/certificate-download.routes";
import emailModule from "./modules/email";

const app = express();

/* =========================
   🔥 CORS
========================= */
app.use(cors());

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   LOGGER
========================= */
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

/* =========================
   API ROUTES
========================= */
app.use("/api/email-config", emailModule.routes);
app.use("/api/certificate", certificateDownloadRoutes);
app.use("/api", routes);

/* =========================
   SERVE REACT BUILD (Correct Path)
========================= */

// Since backend runs from BE-v4,
// move one level up to Certiauto,
// then go to certificate-frontend/build

const FRONTEND_BUILD_PATH = path.join(
  process.cwd(),
  "..",
  "certificate-frontend",
  "build"
);

if (fs.existsSync(FRONTEND_BUILD_PATH)) {
  console.log("✅ Serving React from:", FRONTEND_BUILD_PATH);

  app.use(express.static(FRONTEND_BUILD_PATH));

  // All non-API routes go to React
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
  });
} else {
  console.log(
    "⚠ React build not found. Running in API-only mode."
  );

  // Optional: simple root route
  app.get("/", (req, res) => {
    res.send("✅ CertiAuto Backend Running (API Mode)");
  });
}

export default app;