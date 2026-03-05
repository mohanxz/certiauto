// src/components/bulk-email/BulkEmailCampaign.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import StudentSelector from "./StudentSelector";
import { bulkEmailAPI } from "../../api/bulkEmail";
import { mailTemplatesAPI } from "../../api/temp";
import { certificateTemplatesAPI } from "../../api/certificateTemplates";
import { useToast } from "../../hooks/useToast";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import {
  downloadIndividualCertificate,
  downloadBulkCertificates,
} from "../../api/certificateDownload";
import { downloadBlob } from "../../utils/downloadBlob";
import StudentForm from "../students/StudentForm";
import { studentAPI } from "../../api/students";
import { batchAPI } from "../../api/batches";
import { courseAPI } from "../../api/courses";
import { useTheme } from "../../context/ThemeContext";

const BulkEmailCampaign = () => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    programId: "",
    batchIds: [],
    courseIds: [],
    status: "active",
    search: "",
  });
  const [campaignData, setCampaignData] = useState({
    title: "",
    type: "COURSE_CERTIFICATE",
    subject: "",
    body: "",
    certificateTemplateId: "",
    mailTemplateId: "",
    senderEmailId: "",
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mailTemplates, setMailTemplates] = useState([]);
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [sendingIndividual, setSendingIndividual] = useState(null);
  const [updatingStudent, setUpdatingStudent] = useState(null);
  const [showAppPassword, setShowAppPassword] = useState(false);

  // Email Configuration States
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    appPassword: "",
    provider: "gmail",
  });
  const [activeEmailId, setActiveEmailId] = useState(null);
  const [testingEmail, setTestingEmail] = useState(null);
  const [activatingEmail, setActivatingEmail] = useState(null);

  const { showToast } = useToast();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Function to generate auto campaign name
  const generateCampaignName = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const timeStr = now.toTimeString().split(":").slice(0, 2).join("");
    const dayStr = now.toLocaleDateString("en-US", { weekday: "short" });

    return `CertCampaign_${dateStr}_${timeStr}_${dayStr}`;
  };

  // Load all data on component mount
  useEffect(() => {
    loadTemplates();
    loadBatchesAndCourses();
    loadEmailConfigs();

    setCampaignData((prev) => ({
      ...prev,
      title: generateCampaignName(),
    }));
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      const mailResponse = await mailTemplatesAPI.getAllTemplates();
      if (mailResponse.success) {
        setMailTemplates(mailResponse.data || []);
      } else if (mailResponse.data?.success) {
        setMailTemplates(mailResponse.data.data || []);
      }

      const certResponse = await certificateTemplatesAPI.getAllTemplates();
      if (certResponse.success) {
        setCertificateTemplates(certResponse.data || []);
      } else if (certResponse.data?.success) {
        setCertificateTemplates(certResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      showToast("Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBatchesAndCourses = async () => {
    try {
      setLoading(true);

      const batchResponse = await batchAPI.getAllBatches({ isActive: true });
      if (batchResponse.data?.success) {
        setBatches(batchResponse.data.data || []);
      } else if (batchResponse.success) {
        setBatches(batchResponse.data || []);
      } else if (batchResponse.data) {
        const batchData = Array.isArray(batchResponse.data)
          ? batchResponse.data
          : batchResponse.data.data || [];
        setBatches(batchData.filter((batch) => batch.isActive));
      }

      const courseResponse = await courseAPI.getAllCourses({ isActive: true });
      if (courseResponse.data?.success) {
        setCourses(courseResponse.data.data || []);
      } else if (courseResponse.success) {
        setCourses(courseResponse.data || []);
      } else if (courseResponse.data) {
        const courseData = Array.isArray(courseResponse.data)
          ? courseResponse.data
          : courseResponse.data.data || [];
        setCourses(courseData.filter((course) => course.isActive));
      }
    } catch (error) {
      console.error("Error loading batches/courses:", error);
      showToast("Failed to load batches/courses", "warning");
    } finally {
      setLoading(false);
    }
  };

  const loadEmailConfigs = async () => {
    try {
      console.log("🔄 Loading email configurations...");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/email-config`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setEmailConfigs(data.data);
        console.log(`📧 Loaded ${data.data.length} email configs`);

        const active = data.data.find((email) => email.isActive);
        if (active) {
          console.log(" Active email found:", active.email);
          setActiveEmailId(active._id);

          setCampaignData((prev) => {
            if (!prev.senderEmailId || prev.senderEmailId !== active._id) {
              console.log(
                `📧 Setting campaign to use active email: ${active.email}`,
              );
              return {
                ...prev,
                senderEmailId: active._id,
              };
            }
            return prev;
          });
        } else {
          console.warn("⚠️ No active email found in configurations");
          if (data.data.length > 0) {
            console.log(
              "ℹ️ First email will be auto-selected:",
              data.data[0].email,
            );
            setCampaignData((prev) => ({
              ...prev,
              senderEmailId: data.data[0]._id,
            }));
          }
        }
      } else {
        console.error("Failed to load email configs:", data.message);
      }
    } catch (error) {
      console.error("Error loading email configs:", error);
      showToast("Failed to load email configurations", "error");
    }
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmailConfig = async (e) => {
    e.preventDefault();

    if (!emailFormData.email || !emailFormData.appPassword) {
      showToast("Email and App Password are required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/email-config`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailFormData),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Email configuration added successfully", "success");
        setShowEmailForm(false);
        setEmailFormData({ email: "", appPassword: "", provider: "gmail" });

        if (emailConfigs.length === 0) {
          showToast("Setting this as your active email...", "info");
          setTimeout(() => {
            handleSetActiveEmail(data.data._id);
          }, 1000);
        }

        loadEmailConfigs();
      } else {
        showToast(data.message || "Failed to add email configuration", "error");
      }
    } catch (error) {
      console.error("Error adding email config:", error);
      showToast("Failed to add email configuration", "error");
    }
  };

  const handleSetActiveEmail = async (id) => {
    try {
      setActivatingEmail(id);
      console.log(`🔄 Activating email config: ${id}`);

      const selectedConfig = emailConfigs.find((e) => e._id === id);
      if (!selectedConfig) {
        showToast("Email configuration not found", "error");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/email-config/activate/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log(` Email activated: ${selectedConfig.email}`);
        showToast(`Active email set to: ${selectedConfig.email}`, "success");

        setActiveEmailId(id);

        setCampaignData((prev) => ({
          ...prev,
          senderEmailId: id,
        }));

        console.log(`📧 Campaign now using: ${selectedConfig.email}`);

        await loadEmailConfigs();

        setTimeout(() => {
          showToast(
            ` All emails will be sent from: ${selectedConfig.email}`,
            "info",
            3000,
          );
        }, 500);
      } else {
        showToast(data.message || "Failed to update active email", "error");
      }
    } catch (error) {
      console.error("Error setting active email:", error);
      showToast("Failed to update active email", "error");
    } finally {
      setActivatingEmail(null);
    }
  };

  const handleTestEmail = async (emailConfig) => {
    try {
      setTestingEmail(emailConfig._id);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/email-config/test/${emailConfig._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: emailConfig.email,
            subject: "Test Email from CertiAuto",
            message:
              "This is a test email to verify your email configuration is working correctly.",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showToast(
          `Test email sent successfully to ${emailConfig.email}`,
          "success",
        );
      } else {
        showToast(data.message || "Failed to send test email", "error");
      }
    } catch (error) {
      console.error("Error testing email:", error);
      showToast("Failed to send test email", "error");
    } finally {
      setTestingEmail(null);
    }
  };

  const handleDeleteEmailConfig = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this email configuration?",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/email-config/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        showToast("Email configuration deleted successfully", "success");
        loadEmailConfigs();

        if (activeEmailId === id) {
          setActiveEmailId(null);
          setCampaignData((prev) => ({
            ...prev,
            senderEmailId: "",
          }));
        }
      } else {
        showToast(
          data.message || "Failed to delete email configuration",
          "error",
        );
      }
    } catch (error) {
      console.error("Error deleting email config:", error);
      showToast("Failed to delete email configuration", "error");
    }
  };

  const handleSenderEmailChange = (e) => {
    const emailId = e.target.value;
    const selectedConfig = emailConfigs.find((e) => e._id === emailId);

    setCampaignData((prev) => ({
      ...prev,
      senderEmailId: emailId,
    }));

    if (selectedConfig) {
      console.log(`📧 Selected email: ${selectedConfig.email}`);

      if (!selectedConfig.isActive) {
        const confirmSetActive = window.confirm(
          `The email "${selectedConfig.email}" is not active.\n\n` +
            `Do you want to set it as active before sending?\n\n` +
            `Click OK to activate it now, or Cancel to continue without activating.`,
        );

        if (confirmSetActive) {
          handleSetActiveEmail(emailId);
        }
      }
    }
  };

  const handleMailTemplateChange = (e) => {
    const templateId = e.target.value;
    if (templateId === "") {
      setCampaignData((prev) => ({
        ...prev,
        mailTemplateId: "",
        subject: "",
        body: "",
      }));
    } else {
      const template = mailTemplates.find((t) => t._id === templateId);
      if (template) {
        setCampaignData((prev) => ({
          ...prev,
          mailTemplateId: template._id,
          subject: template.subject,
          body: template.body,
        }));
      }
    }
  };

  const handleCertificateTemplateChange = (e) => {
    const templateId = e.target.value;
    setCampaignData((prev) => ({
      ...prev,
      certificateTemplateId: templateId,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStudentSelection = (students) => {
    setSelectedStudents(students);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const validateStep1 = () => {
    if (selectedStudents.length === 0) {
      showToast("Please select at least one student", "error");
      return false;
    }

    if (!campaignData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return false;
    }

    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    if (!selectedEmail) {
      showToast("Selected email configuration not found", "error");
      return false;
    }

    if (!selectedEmail.isActive) {
      const confirmed = window.confirm(
        `⚠️ IMPORTANT: The email "${selectedEmail.email}" is NOT active.\n\n` +
          `Emails may fail to send if the email is not active.\n\n` +
          `Do you want to:\n` +
          `1. Continue anyway (may fail)\n` +
          `2. Activate this email first (recommended)\n\n` +
          `Click OK to activate it now, or Cancel to continue without activating.`,
      );

      if (confirmed) {
        handleSetActiveEmail(campaignData.senderEmailId);
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (campaignData.subject.trim() === "") {
      showToast("Please enter email subject", "error");
      return false;
    }
    if (campaignData.body.trim() === "") {
      showToast("Please enter email body", "error");
      return false;
    }
    if (!campaignData.certificateTemplateId) {
      showToast("Please select a certificate template", "error");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSendAll = () => {
    if (!validateStep1()) return;
    if (!validateStep2()) return;

    if (!campaignData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return;
    }

    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    if (!selectedEmail) {
      showToast("Selected email configuration not found", "error");
      return;
    }

    let warningMessage = `Start campaign "${campaignData.title}" and send ${selectedStudents.length} emails`;

    if (!selectedEmail.isActive) {
      warningMessage += `\n\n⚠️ WARNING: The email "${selectedEmail.email}" is NOT active.\nEmails may fail to send.`;
    } else {
      warningMessage += ` from ${selectedEmail.email}`;
    }

    const certTypeText =
      campaignData.type === "COURSE_CERTIFICATE"
        ? "Course Completion Certificate"
        : "Internship Certificate";
    warningMessage += `\n\nCertificate Type: ${certTypeText}`;

    if (window.confirm(warningMessage)) {
      handleSendEmails();
    }
  };

  const handleSendEmails = async () => {
    if (selectedStudents.length === 0) {
      showToast("No students selected", "error");
      return;
    }

    console.log("=== STARTING EMAIL CAMPAIGN ===");
    console.log("Campaign Type:", campaignData.type);
    console.log("Sender Email ID:", campaignData.senderEmailId);
    console.log("Available Configs:", emailConfigs);

    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    console.log("Selected Email Config:", selectedEmail);

    if (!campaignData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return;
    }

    if (!selectedEmail) {
      showToast("Selected email configuration not found or invalid", "error");
      return;
    }

    if (!selectedEmail.isActive) {
      const proceed = window.confirm(
        `FINAL WARNING: "${selectedEmail.email}" is NOT active.\n\n` +
          `Emails will likely fail to send.\n\n` +
          `Do you want to activate it now or cancel?`,
      );

      if (proceed) {
        await handleSetActiveEmail(campaignData.senderEmailId);
        showToast("Email activated. Please try sending again.", "info");
        return;
      } else {
        showToast("Campaign cancelled", "info");
        return;
      }
    }

    try {
      setProcessing(true);

      const campaignPayload = {
        title: campaignData.title,
        type: campaignData.type,
        subject: campaignData.subject,
        body: campaignData.body,
        mailTemplateId: campaignData.mailTemplateId || null,
        certificateTemplateId: campaignData.certificateTemplateId,
        senderEmailId: campaignData.senderEmailId,
        studentIds: selectedStudents.map((s) => s._id),
        batchIds:
          filters.batchIds.length > 0
            ? filters.batchIds
            : [
                ...new Set(
                  selectedStudents.map((s) => s.batchId?._id).filter(Boolean),
                ),
              ],
      };

      console.log("📤 Sending campaign with payload:", {
        type: campaignPayload.type,
        senderEmailId: campaignPayload.senderEmailId,
        senderEmail: selectedEmail.email,
        totalStudents: campaignPayload.studentIds.length,
        isActive: selectedEmail.isActive,
      });

      const response = await bulkEmailAPI.createCampaign(campaignPayload);

      if (response.success || response.data?.success) {
        const certTypeText =
          campaignData.type === "COURSE_CERTIFICATE"
            ? "Course Completion"
            : "Internship";

        showToast(
          ` 🎉 ${certTypeText} Campaign created successfully! ${selectedStudents.length} emails are being sent from ${selectedEmail.email}.`,
          "success",
        );

        if (window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        setTimeout(() => {
          setStep(1);
          setSelectedStudents([]);
          setCampaignData({
            title: generateCampaignName(),
            type: "COURSE_CERTIFICATE",
            subject: "",
            body: "",
            certificateTemplateId: "",
            mailTemplateId: "",
            senderEmailId: activeEmailId || "",
          });
          setFilters({
            programId: "",
            batchIds: [],
            courseIds: [],
            status: "active",
            search: "",
          });
        }, 1500);
      } else {
        showToast(response?.message || "Failed to create campaign", "error");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      showToast(
        error.message ||
          error.response?.data?.message ||
          "Failed to send emails",
        "error",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAllCertificates = async () => {
    if (!campaignData.certificateTemplateId) {
      showToast("Select certificate template first", "error");
      return;
    }

    try {
      setDownloading("all");

      const studentIds = selectedStudents.map((s) => s._id);
      const res = await downloadBulkCertificates(
        studentIds,
        campaignData.certificateTemplateId,
      );

      downloadBlob(res.data, `certificates_${Date.now()}.zip`);

      showToast(" All certificates downloaded successfully!", "success");

      setTimeout(() => {
        setDownloading(null);
      }, 1000);
    } catch (err) {
      showToast("❌ Failed to download certificates", "error");
      setDownloading(null);
    }
  };

  const handleDownloadIndividual = async (student) => {
    if (!campaignData.certificateTemplateId) {
      showToast("Select certificate template first", "error");
      return;
    }

    try {
      setDownloading(student._id);

      const res = await downloadIndividualCertificate(
        student._id,
        campaignData.certificateTemplateId,
      );

      downloadBlob(res.data, `${student.name}_certificate.pdf`);

      showToast(` Certificate downloaded for ${student.name}`, "success");

      setTimeout(() => {
        setDownloading(null);
      }, 1000);
    } catch (err) {
      showToast("❌ Failed to download certificate", "error");
      setDownloading(null);
    }
  };

  const handleSendIndividual = async (student) => {
    if (!validateStep2()) return;

    if (!campaignData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return;
    }

    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    if (!selectedEmail) {
      showToast("Selected email configuration not found", "error");
      return;
    }

    if (!selectedEmail.isActive) {
      const confirm = window.confirm(
        `The email "${selectedEmail.email}" is not active.\n\n` +
          `Do you want to activate it before sending?`,
      );

      if (confirm) {
        await handleSetActiveEmail(campaignData.senderEmailId);
        showToast("Email activated. Please try sending again.", "info");
        return;
      }
    }

    try {
      setSendingIndividual(student._id);

      const payload = {
        title: `Individual - ${student.name}`,
        type: campaignData.type,
        subject: campaignData.subject,
        body: campaignData.body,
        mailTemplateId: campaignData.mailTemplateId || null,
        certificateTemplateId: campaignData.certificateTemplateId,
        senderEmailId: campaignData.senderEmailId,
        studentIds: [student._id],
        batchIds: student.batchId?._id ? [student.batchId._id] : [],
      };

      console.log("Sending individual email from:", selectedEmail.email);
      console.log("Certificate type:", campaignData.type);

      const response = await bulkEmailAPI.createCampaign(payload);

      if (response.success || response.data?.success) {
        const certTypeText =
          campaignData.type === "COURSE_CERTIFICATE"
            ? "Course Completion"
            : "Internship";

        showToast(
          ` ${certTypeText} Certificate email sent to ${student.name} from ${selectedEmail.email}`,
          "success",
        );

        setTimeout(() => {
          setSendingIndividual(null);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      showToast(`❌ Failed to send to ${student.name}`, "error");
      setSendingIndividual(null);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleUpdateStudent = async (studentId, updatedData) => {
    try {
      setUpdatingStudent(studentId);

      const response = await studentAPI.updateStudent(studentId, updatedData);

      if (response.success || response.data?.success) {
        showToast("Student updated successfully", "success");

        setSelectedStudents((prev) =>
          prev.map((student) =>
            student._id === studentId
              ? {
                  ...student,
                  ...updatedData,
                  _updated: true,
                }
              : student,
          ),
        );

        setTimeout(() => {
          setSelectedStudents((prev) =>
            prev.map((student) =>
              student._id === studentId
                ? { ...student, _updated: false }
                : student,
            ),
          );
        }, 2000);

        setShowStudentForm(false);
        setEditingStudent(null);
      }
    } catch (error) {
      showToast("❌ Error updating student", "error");
    } finally {
      setUpdatingStudent(null);
    }
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.filter((student) => student._id !== studentId),
    );
    showToast("🗑️ Student removed from list", "info");
  };

  const debugCurrentState = () => {
    console.log("=== DEBUG STATE ===");
    console.log("Campaign Type:", campaignData.type);
    console.log("Active Email ID:", activeEmailId);
    console.log("Campaign Sender Email ID:", campaignData.senderEmailId);
    console.log(
      "Email Configs:",
      emailConfigs.map((e) => ({
        email: e.email,
        id: e._id,
        isActive: e.isActive,
      })),
    );

    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    console.log("Selected Email:", selectedEmail);

    if (selectedEmail) {
      console.log("Will send from:", selectedEmail.email);
      console.log("Is active?", selectedEmail.isActive);
    }
  };

  // Render Email Configuration Section with Dark Mode
  const renderEmailConfigSection = () => (
    <div className={`rounded-lg border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Sender Email Configuration
        </h4>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              window.open("https://myaccount.google.com/apppasswords", "_blank")
            }
            variant="outline"
            size="small"
            icon="fas fa-plus"
            className={isDarkMode 
              ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
              : 'border-green-600 text-green-600'
            }
          >
            Generate Gmail App Password
          </Button>
          <Button
            onClick={() => setShowEmailForm(true)}
            variant="outline"
            size="small"
            icon="fas fa-plus"
            className={isDarkMode 
              ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
              : 'border-green-600 text-green-600'
            }
          >
            Add Email
          </Button>
        </div>
      </div>

      {emailConfigs.length === 0 ? (
        <div className={`text-center py-8 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <i className={`fas fa-envelope text-4xl mb-3 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-300'
          }`}></i>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No email configurations found</p>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Add an email configuration to send emails
          </p>
          <Button
            onClick={() => setShowEmailForm(true)}
            variant="primary"
            size="small"
            icon="fas fa-plus"
          >
            Add Your First Email
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Sender Email *
              </label>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Active email:{" "}
                {emailConfigs.find((e) => e.isActive)?.email || "None"}
              </span>
            </div>
            <select
              value={campaignData.senderEmailId || ""}
              onChange={handleSenderEmailChange}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="">-- Choose sender email --</option>
              {emailConfigs.map((config) => (
                <option key={config._id} value={config._id}>
                  {config.email} {config.isActive && "★ Active"}
                </option>
              ))}
            </select>

            {campaignData.senderEmailId && (
              <div className="mt-2">
                <div className="flex items-center text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Selected:</span>
                  <span className={`font-medium ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {
                      emailConfigs.find(
                        (e) => e._id === campaignData.senderEmailId,
                      )?.email
                    }
                  </span>
                  {emailConfigs.find(
                    (e) => e._id === campaignData.senderEmailId,
                  )?.isActive ? (
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-green-900/30 text-green-300 border border-green-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <i className="fas fa-check mr-1"></i> Active
                    </span>
                  ) : (
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <i className="fas fa-exclamation-triangle mr-1"></i> Not Active
                    </span>
                  )}
                </div>
                <div className={`mt-1 text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  <i className="fas fa-info-circle mr-1"></i>
                  All emails will be sent from this address
                </div>
              </div>
            )}
          </div>

          <div className={`mt-4 border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Configured Emails ({emailConfigs.length})
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {emailConfigs.map((config) => (
                <div
                  key={config._id}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    config.isActive
                      ? isDarkMode
                        ? 'border-green-800 bg-green-900/20'
                        : 'border-green-200 bg-green-50'
                      : isDarkMode
                        ? 'border-gray-700 bg-gray-800'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        config.isActive 
                          ? isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                          : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <i
                        className={`fas fa-envelope ${
                          config.isActive 
                            ? isDarkMode ? 'text-green-400' : 'text-green-600'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      ></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {config.email}
                        {config.isActive && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            isDarkMode 
                              ? 'bg-green-900/30 text-green-300' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            Active
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {config.provider}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleTestEmail(config)}
                      disabled={testingEmail === config._id}
                      className={`p-1 rounded ${
                        isDarkMode 
                          ? 'text-blue-400 hover:bg-blue-900/20' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Test Email"
                    >
                      <i
                        className={`fas ${
                          testingEmail === config._id
                            ? "fa-spinner fa-spin"
                            : "fa-paper-plane"
                        }`}
                      ></i>
                    </button>
                    {!config.isActive && (
                      <button
                        onClick={() => handleSetActiveEmail(config._id)}
                        disabled={activatingEmail === config._id}
                        className={`p-1 rounded ${
                          isDarkMode 
                            ? 'text-green-400 hover:bg-green-900/20' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title="Set as Active"
                      >
                        <i
                          className={`fas ${
                            activatingEmail === config._id
                              ? "fa-spinner fa-spin"
                              : "fa-star"
                          }`}
                        ></i>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEmailConfig(config._id)}
                      className={`p-1 rounded ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render step content with Dark Mode
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {renderEmailConfigSection()}
            <StudentSelector
              onSelectionChange={handleStudentSelection}
              onFilterChange={handleFilterChange}
              filters={filters}
              selectedStudents={selectedStudents}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className={`rounded-lg border p-6 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Email Content
              </h4>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Certificate Type *
                  </label>
                  <select
                    name="type"
                    value={campaignData.type}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="COURSE_CERTIFICATE">
                      Course Completion Certificate
                    </option>
                    <option value="INTERNSHIP_CERTIFICATE">
                      Internship Certificate
                    </option>
                  </select>
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select the type of certificate to generate and send
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Choose Mail Template
                  </label>
                  <div className="flex gap-3 items-start">
                    <select
                      value={campaignData.mailTemplateId || ""}
                      onChange={handleMailTemplateChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">-- Select a mail template --</option>
                      {mailTemplates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => window.open("/mail-templates", "_blank")}
                      variant="outline"
                      size="small"
                      icon="fas fa-external-link-alt"
                      className={isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'whitespace-nowrap'
                      }
                    >
                      Manage Mail Templates
                    </Button>
                  </div>
                  {campaignData.mailTemplateId && (
                    <div className={`mt-2 text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      <i className="fas fa-check-circle mr-1"></i>
                      Template selected
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={campaignData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Your Certificate is Ready!"
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Body *
                  </label>
                  <textarea
                    name="body"
                    value={campaignData.body}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Dear {name}, ..."
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    required
                  />
                  <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Available placeholders: {"{name}"}, {"{program}"},{" "}
                    {"{course}"}, {"{batch}"}, {"{finalMark}"},{" "}
                    {"{completionDate}"}, {"{uniqueId}"}, {"{certificateId}"}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Certificate Template *
                  </label>
                  <div className="flex gap-3 items-start">
                    <select
                      value={campaignData.certificateTemplateId || ""}
                      onChange={handleCertificateTemplateChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="">
                        -- Select a certificate template --
                      </option>
                      {certificateTemplates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.originalName || template.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => window.open("/templates", "_blank")}
                      variant="outline"
                      size="small"
                      icon="fas fa-external-link-alt"
                      className={isDarkMode 
                        ? 'border-purple-700 text-purple-400 hover:bg-purple-900/20' 
                        : 'border-purple-600 text-purple-600'
                      }
                    >
                      Manage Certi Templates
                    </Button>
                  </div>
                  {campaignData.certificateTemplateId && (
                    <div className={`mt-2 text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      <i className="fas fa-check-circle mr-1"></i>
                      Certificate template selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        const selectedEmail = emailConfigs.find(
          (e) => e._id === campaignData.senderEmailId,
        );

        const getCertificateTypeDisplay = () => {
          if (campaignData.type === "COURSE_CERTIFICATE") {
            return "Course Completion Certificate";
          } else if (campaignData.type === "INTERNSHIP_CERTIFICATE") {
            return "Internship Certificate";
          }
          return "Certificate";
        };

        const getCertificateTypeIcon = () => {
          return campaignData.type === "COURSE_CERTIFICATE"
            ? "fa-graduation-cap"
            : "fa-briefcase";
        };

        const getCertificateTypeColor = () => {
          return campaignData.type === "COURSE_CERTIFICATE"
            ? isDarkMode ? "text-blue-400" : "text-blue-600"
            : isDarkMode ? "text-green-400" : "text-green-600";
        };

        return (
          <div className="space-y-6">
            <div className={`rounded-lg border p-6 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Review & Send Campaign
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Campaign</div>
                    <div className={`text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {campaignData.title}
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                      Auto-generated
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>Recipients</div>
                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedStudents.length} students
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    campaignData.type === "COURSE_CERTIFICATE"
                      ? isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                      : isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                  }`}>
                    <div className={`text-sm ${campaignData.type === "COURSE_CERTIFICATE" ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') : (isDarkMode ? 'text-green-300' : 'text-green-600')}`}>
                      Type
                    </div>
                    <div className={`text-lg font-semibold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <i className={`fas ${getCertificateTypeIcon()} mr-2 ${getCertificateTypeColor()}`}></i>
                      {getCertificateTypeDisplay()}
                    </div>
                    <div className={`text-xs mt-1 ${
                      campaignData.type === "COURSE_CERTIFICATE"
                        ? isDarkMode ? 'text-blue-400' : 'text-blue-500'
                        : isDarkMode ? 'text-green-400' : 'text-green-500'
                    }`}>
                      PDF attachment included
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    selectedEmail?.isActive
                      ? isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                      : isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                  }`}>
                    <div className={`text-sm ${
                      selectedEmail?.isActive
                        ? isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                        : isDarkMode ? 'text-red-300' : 'text-red-600'
                    }`}>
                      Sender
                    </div>
                    <div className={`text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEmail?.email || "Not selected"}
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedEmail?.isActive
                        ? isDarkMode ? 'text-yellow-400' : 'text-yellow-500'
                        : isDarkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                      {selectedEmail?.isActive ? "Active ✓" : "NOT ACTIVE ⚠️"}
                    </div>
                  </div>
                </div>

                <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h5 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Certificate Details
                  </h5>
                  <div className={`flex items-center p-3 rounded-lg border ${
                    campaignData.type === "COURSE_CERTIFICATE"
                      ? isDarkMode
                        ? 'bg-blue-900/20 border-blue-800'
                        : 'bg-blue-50 border-blue-200'
                      : isDarkMode
                        ? 'bg-green-900/20 border-green-800'
                        : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      campaignData.type === "COURSE_CERTIFICATE"
                        ? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                        : isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                    }`}>
                      <i className={`fas ${getCertificateTypeIcon()} ${
                        campaignData.type === "COURSE_CERTIFICATE"
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}></i>
                    </div>
                    <div className="ml-3">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getCertificateTypeDisplay()}
                      </div>
                      <div className={`text-sm ${
                        campaignData.type === "COURSE_CERTIFICATE"
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {campaignData.type === "COURSE_CERTIFICATE"
                          ? "Format: CNTTCPP + YY + 5-digit serial (e.g., CNTTCPP2500001)"
                          : "Format: UDYAM-<STATE>-<BRANCH>-7-digit serial (e.g., UDYAM-TN-02-0000001)"}
                      </div>
                      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {campaignData.type === "COURSE_CERTIFICATE"
                          ? "Course Completion Certificate ID will be generated and stored permanently"
                          : "Internship Certificate ID will be generated and stored permanently"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedEmail && (
                  <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h5 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sender Information
                    </h5>
                    <div className={`flex items-center p-3 rounded-lg border ${
                      selectedEmail.isActive
                        ? isDarkMode
                          ? 'bg-green-900/20 border-green-800'
                          : 'bg-green-50 border-green-200'
                        : isDarkMode
                          ? 'bg-red-900/20 border-red-800'
                          : 'bg-red-50 border-red-200'
                    }`}>
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        selectedEmail.isActive
                          ? isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                          : isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                      }`}>
                        {selectedEmail.isActive ? (
                          <i className={`fas fa-check ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}></i>
                        ) : (
                          <i className={`fas fa-exclamation-triangle ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}></i>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className={`font-medium flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedEmail.email}
                          {selectedEmail.isActive ? (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDarkMode 
                                ? 'bg-green-900/30 text-green-300 border border-green-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              <i className="fas fa-check mr-1"></i> Active
                            </span>
                          ) : (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDarkMode 
                                ? 'bg-red-900/30 text-red-300 border border-red-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <i className="fas fa-exclamation-triangle mr-1"></i> Not Active
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${
                          selectedEmail.isActive
                            ? isDarkMode ? 'text-green-400' : 'text-green-600'
                            : isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {selectedEmail.isActive
                            ? "All emails will be sent from this address"
                            : "⚠️ Emails may fail to send. Activate this email first."}
                        </div>
                        {!selectedEmail.isActive && (
                          <Button
                            onClick={() => handleSetActiveEmail(selectedEmail._id)}
                            variant="outline"
                            size="extra-small"
                            className={`mt-2 ${
                              isDarkMode 
                                ? 'border-red-700 text-red-400 hover:bg-red-900/20' 
                                : 'border-red-600 text-red-600 hover:bg-red-50'
                            }`}
                            icon={
                              activatingEmail === selectedEmail._id
                                ? "fas fa-spinner fa-spin"
                                : "fas fa-star"
                            }
                            loading={activatingEmail === selectedEmail._id}
                          >
                            Activate This Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h5 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Preview
                  </h5>
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Subject: {campaignData.subject}
                    </div>
                    <div className={`whitespace-pre-line p-3 rounded ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'
                    }`}>
                      {campaignData.body}
                    </div>
                  </div>
                </div>

                {campaignData.certificateTemplateId && (
                  <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h5 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Certificate Included
                    </h5>
                    <div className={`flex items-center p-3 rounded-lg ${
                      campaignData.type === "COURSE_CERTIFICATE"
                        ? isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                        : isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                    }`}>
                      <i className={`fas ${getCertificateTypeIcon()} text-xl mr-3 ${
                        campaignData.type === "COURSE_CERTIFICATE"
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}></i>
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getCertificateTypeDisplay()} (PDF)
                        </div>
                        <div className={`text-sm ${
                          campaignData.type === "COURSE_CERTIFICATE"
                            ? isDarkMode ? 'text-blue-400' : 'text-blue-500'
                            : isDarkMode ? 'text-green-400' : 'text-green-500'
                        }`}>
                          Template:{" "}
                          {certificateTemplates.find(
                            (t) => t._id === campaignData.certificateTemplateId,
                          )?.originalName || "Selected"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEmail && !selectedEmail.isActive && (
                  <div className={`border-t pt-4 ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-red-900/20 border-red-800' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center">
                        <i className={`fas fa-exclamation-triangle mr-3 text-xl ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}></i>
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                            ⚠️ IMPORTANT: Email is Not Active
                          </div>
                          <div className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            The selected email "{selectedEmail.email}" is not
                            active. Emails will likely fail to send. Please
                            activate it first.
                          </div>
                          <Button
                            onClick={() => handleSetActiveEmail(selectedEmail._id)}
                            variant="danger"
                            size="small"
                            className="mt-2"
                            icon={
                              activatingEmail === selectedEmail._id
                                ? "fas fa-spinner fa-spin"
                                : "fas fa-star"
                            }
                            loading={activatingEmail === selectedEmail._id}
                          >
                            Activate "{selectedEmail.email}" Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Selected Students ({selectedStudents.length})
                    </h5>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                        size="small"
                        icon="fas fa-user-plus"
                        className={isDarkMode 
                          ? 'border-blue-700 text-blue-400 hover:bg-blue-900/20' 
                          : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                        }
                      >
                        Add More Students
                      </Button>
                      <Button
                        onClick={handleDownloadAllCertificates}
                        variant="outline"
                        size="small"
                        icon={
                          downloading === "all"
                            ? "fas fa-spinner fa-spin"
                            : "fas fa-file-archive"
                        }
                        loading={downloading === "all"}
                        className={isDarkMode 
                          ? 'border-green-700 text-green-400 hover:bg-green-900/20' 
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                        }
                      >
                        {downloading === "all"
                          ? "Downloading..."
                          : "Download All as ZIP"}
                      </Button>
                      <Button
                        onClick={handleSendAll}
                        variant={selectedEmail?.isActive ? "success" : "danger"}
                        size="small"
                        icon={
                          processing
                            ? "fas fa-spinner fa-spin"
                            : selectedEmail?.isActive
                              ? "fas fa-paper-plane"
                              : "fas fa-exclamation-triangle"
                        }
                        loading={processing}
                        disabled={!selectedEmail?.isActive}
                      >
                        {processing
                          ? "Starting Campaign..."
                          : selectedEmail?.isActive
                            ? "Start Campaign"
                            : "Email Not Active"}
                      </Button>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 max-h-96 overflow-y-auto ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="space-y-2">
                      {selectedStudents.map((student) => (
                        <div
                          key={student._id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                            student._updated
                              ? isDarkMode
                                ? 'border-green-800 bg-green-900/20'
                                : 'border-green-300 bg-green-50'
                              : isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                            }`}>
                              {updatingStudent === student._id ? (
                                <i className="fas fa-spinner fa-spin text-blue-600"></i>
                              ) : student._updated ? (
                                <i className={`fas fa-check ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}></i>
                              ) : (
                                <i className={`fas fa-user ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}></i>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className={`text-sm font-medium flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {student.name}
                                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                  isDarkMode 
                                    ? 'bg-blue-900/30 text-blue-300' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {student.uniqueId}
                                </span>
                                {updatingStudent === student._id && (
                                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                    isDarkMode 
                                      ? 'bg-blue-900/30 text-blue-300' 
                                      : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    Updating...
                                  </span>
                                )}
                                {student._updated && (
                                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                    isDarkMode 
                                      ? 'bg-green-900/30 text-green-300' 
                                      : 'bg-green-100 text-green-600'
                                  }`}>
                                    <i className="fas fa-check mr-1"></i>
                                    Updated!
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {student.email} •{" "}
                                {student.batchId?.batchName || "No Batch"}
                                {student.finalMark &&
                                  ` • Mark: ${student.finalMark}%`}
                                {student.enrolledCourseIds?.length > 0 &&
                                  ` • ${student.enrolledCourseIds.length} course(s)`}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditStudent(student)}
                              variant="ghost"
                              size="extra-small"
                              icon="fas fa-edit"
                              className={isDarkMode 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                              }
                              title="Edit Student"
                              disabled={
                                updatingStudent === student._id || processing
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDownloadIndividual(student)}
                              variant="ghost"
                              size="extra-small"
                              icon={
                                downloading === student._id
                                  ? "fas fa-spinner fa-spin"
                                  : "fas fa-download"
                              }
                              loading={downloading === student._id}
                              className={isDarkMode 
                                ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              }
                              title="Download Certificate"
                              disabled={
                                downloading ||
                                !campaignData.certificateTemplateId ||
                                processing
                              }
                            >
                              {downloading === student._id ? "..." : "Cert"}
                            </Button>
                            <Button
                              onClick={() => handleSendIndividual(student)}
                              variant="ghost"
                              size="extra-small"
                              icon={
                                sendingIndividual === student._id
                                  ? "fas fa-spinner fa-spin"
                                  : "fas fa-paper-plane"
                              }
                              loading={sendingIndividual === student._id}
                              className={isDarkMode 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                              }
                              title="Send Individual Email"
                              disabled={
                                sendingIndividual ||
                                processing ||
                                !selectedEmail?.isActive
                              }
                            >
                              {sendingIndividual === student._id
                                ? "..."
                                : "Send"}
                            </Button>
                            <Button
                              onClick={() => handleRemoveStudent(student._id)}
                              variant="ghost"
                              size="extra-small"
                              icon="fas fa-times"
                              className={isDarkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              }
                              title="Remove from List"
                              disabled={processing}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && step === 1) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Bulk Email Campaign
        </h2>
        <div className="flex items-center gap-2">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Step {step} of 3
          </div>
          <button
            onClick={debugCurrentState}
            className={`ml-4 px-3 py-1 text-xs rounded ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Debug
          </button>
        </div>
      </div>

      {/* Progress Steps - Dark mode aware */}
      <div className={`rounded-lg border p-4 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > stepNumber ? (
                  <i className="fas fa-check text-xs"></i>
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <div
                className={`ml-2 text-sm font-medium ${
                  step >= stepNumber
                    ? isDarkMode ? "text-blue-400" : "text-blue-600"
                    : isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {stepNumber === 1 && "Setup & Select"}
                {stepNumber === 2 && "Email Content"}
                {stepNumber === 3 && "Review & Send"}
              </div>
              {stepNumber < 3 && (
                <div className={`ml-4 h-0.5 w-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons - Dark mode aware */}
      <div className={`flex justify-between pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          {step > 1 && (
            <Button
              onClick={handlePrevStep}
              variant="outline"
              icon="fas fa-arrow-left"
              className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {step === 2 && (
            <Button
              onClick={() => {
                const previewWindow = window.open("", "Email Preview");
                previewWindow.document.write(`
                  <html>
                    <head>
                      <title>Email Preview</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: ${isDarkMode ? '#1f2937' : '#f5f5f5'}; }
                        .preview-container { max-width: 600px; margin: 0 auto; background: ${isDarkMode ? '#374151' : 'white'}; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        h2 { color: ${isDarkMode ? '#e5e7eb' : '#333'}; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                        .email-body { border: 1px solid ${isDarkMode ? '#4b5563' : '#ddd'}; padding: 20px; margin: 20px 0; white-space: pre-line; line-height: 1.6; color: ${isDarkMode ? '#e5e7eb' : '#333'}; }
                        .placeholder { background: #f0f9ff; color: #0369a1; padding: 2px 5px; border-radius: 3px; }
                        .footer { color: ${isDarkMode ? '#9ca3af' : '#666'}; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid ${isDarkMode ? '#4b5563' : '#eee'}; }
                      </style>
                    </head>
                    <body>
                      <div class="preview-container">
                        <h2>📧 Email Preview</h2>
                        <div style="margin: 15px 0;">
                          <strong>Subject:</strong> ${campaignData.subject}
                        </div>
                        <div class="email-body">${campaignData.body.replace(/\{([^}]+)\}/g, '<span class="placeholder">{$1}</span>')}</div>
                        <div class="footer">
                          <p><strong>Note:</strong> Placeholders in <span class="placeholder">blue</span> will be replaced with actual data when sent.</p>
                          <p>Certificate Type: ${getCertificateTypeDisplay()}</p>
                          <p>This is a preview only - no email has been sent.</p>
                        </div>
                      </div>
                    </body>
                  </html>
                `);
              }}
              variant="outline"
              icon="fas fa-eye"
              className={isDarkMode 
                ? 'border-yellow-700 text-yellow-400 hover:bg-yellow-900/20' 
                : 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'
              }
            >
              Preview Email
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={handleNextStep}
              variant="primary"
              icon="fas fa-arrow-right"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSendAll}
              variant="success"
              icon={
                processing ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"
              }
              loading={processing}
            >
              {processing ? "Starting Campaign..." : "Start Campaign"}
            </Button>
          )}
        </div>
      </div>

      {/* Student Form Modal - already has dark mode */}
      {showStudentForm && (
        <StudentForm
          onSubmit={(data) => handleUpdateStudent(editingStudent._id, data)}
          onClose={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
          }}
          initialData={editingStudent}
          batches={batches}
          courses={courses}
          title="Edit Student"
        />
      )}

      {/* Add Email Configuration Modal - Dark mode aware */}
      {showEmailForm && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Add Email Configuration
                </h3>
                <button
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmailFormData({
                      email: "",
                      appPassword: "",
                      provider: "gmail",
                    });
                    setShowAppPassword(false);
                  }}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form
                onSubmit={handleAddEmailConfig}
                className="space-y-4"
                autoComplete="off"
              >
                <input type="text" name="fakeuser" style={{ display: "none" }} />
                <input type="password" name="fakepass" style={{ display: "none" }} />

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={emailFormData.email}
                    onChange={handleEmailFormChange}
                    placeholder="your-email@gmail.com"
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    App Password *
                  </label>

                  <div className="relative">
                    <input
                      type={showAppPassword ? "text" : "password"}
                      name="appPassword"
                      autoComplete="new-password"
                      value={emailFormData.appPassword}
                      onChange={(e) => {
                        const noSpaces = e.target.value.replace(/\s/g, "");
                        handleEmailFormChange({
                          target: {
                            name: "appPassword",
                            value: noSpaces,
                          },
                        });
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData("text");
                        const noSpaces = pastedText.replace(/\s/g, "");
                        handleEmailFormChange({
                          target: {
                            name: "appPassword",
                            value: noSpaces,
                          },
                        });
                      }}
                      placeholder="Enter 16-character app password"
                      className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowAppPassword(!showAppPassword)}
                      className={`absolute inset-y-0 right-0 px-3 flex items-center ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={`fas ${showAppPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>

                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enter your 16-character app password (spaces will be removed automatically)
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Provider
                  </label>
                  <select
                    name="provider"
                    value={emailFormData.provider}
                    onChange={handleEmailFormChange}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                    <option value="yahoo">Yahoo</option>
                    <option value="custom">Custom SMTP</option>
                  </select>
                </div>

                <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowEmailForm(false);
                        setEmailFormData({
                          email: "",
                          appPassword: "",
                          provider: "gmail",
                        });
                        setShowAppPassword(false);
                      }}
                      variant="outline"
                      className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" icon="fas fa-save">
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkEmailCampaign;