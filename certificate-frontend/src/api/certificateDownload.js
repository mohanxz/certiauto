import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * =====================================================
 * DOWNLOAD INDIVIDUAL CERTIFICATE (PDF)
 * =====================================================
 */
export const downloadIndividualCertificate = (studentId, templateId) =>
  API.post(
    `/certificate/download/${studentId}`,   // ✅ CORRECT PATH
    { certificateTemplateId: templateId },
    { responseType: "blob" }
  );

/**
 * =====================================================
 * DOWNLOAD BULK CERTIFICATES (ZIP)
 * =====================================================
 */
export const downloadBulkCertificates = (studentIds, templateId) =>
  API.post(
    `/certificate/download-bulk`,          // ✅ CORRECT PATH
    { studentIds, certificateTemplateId: templateId },
    { responseType: "blob" }
  );