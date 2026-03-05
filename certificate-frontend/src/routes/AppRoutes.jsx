// AppRoutes.jsx - Updated with Email Details Route
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

import Login from "../modules/auth/Login";
import Signup from "../modules/auth/Signup";

import Dashboard from "../modules/dashboard/Dashboard";

import ProgramsList from "../modules/programs/ProgramsList";
import CoursesList from "../modules/courses/CoursesList";
import BatchesList from "../modules/batches/BatchesList";
import StudentsList from "../modules/students/StudentsList";

import TemplatesList from "../modules/templates/TemplatesList";
import MailTemplatesList from "../modules/mailTemplates/MailTemplatesList";

import CertificateGenerator from "../modules/certificates/CertificateGenerator";

import BulkEmailSender from "../modules/bulkEmail/BulkEmailCampaign";
import BulkEmailLogs from "../modules/bulkEmail/BulkEmailLogs";

import EmailLogsList from "../modules/mailLogs/EmailLogsList";
import BulkUploadLogs from "../modules/bulkUpload/BulkUploadLogs";

import EmailConfigList from "../modules/emailConfig/EmailConfigList";

// Import the Email Details Page
import EmailDetailsPage from "../modules/students/EmailDetailsModal";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/dashboard" />}
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/programs" element={<ProgramsList />} />
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/batches" element={<BatchesList />} />

        {/* Student Routes */}
        <Route path="/students" element={<StudentsList />} />
        <Route
          path="/students/:studentId/emails"
          element={<EmailDetailsPage />}
        />

        <Route path="/templates" element={<TemplatesList />} />
        <Route path="/mail-templates" element={<MailTemplatesList />} />

        <Route path="/certificates" element={<CertificateGenerator />} />

        <Route path="/bulk-email" element={<BulkEmailSender />} />
        <Route path="/bulk-email-logs" element={<BulkEmailLogs />} />

        <Route path="/mail-logs" element={<EmailLogsList />} />
        <Route path="/upload-logs" element={<BulkUploadLogs />} />

        <Route path="/email-config" element={<EmailConfigList />} />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
