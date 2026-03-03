// components/bulk-email/BulkEmailCampaign.jsx
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

const BulkEmailCampaign = () => {
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
    type: "COURSE_CERTIFICATE", // Changed from "CERTIFICATE" to "COURSE_CERTIFICATE"
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

    // Auto-generate campaign name on component mount
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

      // Load batches
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

      // Load courses
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

  // Email Configuration Functions
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

        // Find active email
        const active = data.data.find((email) => email.isActive);
        if (active) {
          console.log(" Active email found:", active.email);
          setActiveEmailId(active._id);

          // Auto-select active email for campaign
          setCampaignData((prev) => {
            // Only update if senderEmailId is empty or different from active
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

        // If first email, auto-set as active
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

        // Update local state
        setActiveEmailId(id);

        // IMPORTANT: Update campaign to use this email
        setCampaignData((prev) => ({
          ...prev,
          senderEmailId: id,
        }));

        console.log(`📧 Campaign now using: ${selectedConfig.email}`);

        // Reload to get updated configs
        await loadEmailConfigs();

        // Show success message
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

        // If we deleted the active email, clear selection
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

      // Check if selected email is active
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

  // Original handlers
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

    // Check if sender email is selected
    if (!campaignData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return false;
    }

    // Check if selected email exists
    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    if (!selectedEmail) {
      showToast("Selected email configuration not found", "error");
      return false;
    }

    // Warn if selected email is not active
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
        return false; // Prevent continuing until email is activated
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
    // First validate all steps
    if (!validateStep1()) return;
    if (!validateStep2()) return;

    // Additional validation for sender email
    if (!campaignData.senderEmailId) {
      showToast("Please select a sender email", "error");
      return;
    }

    // Check if email config exists
    const selectedEmail = emailConfigs.find(
      (e) => e._id === campaignData.senderEmailId,
    );
    if (!selectedEmail) {
      showToast("Selected email configuration not found", "error");
      return;
    }

    // Show warning if email is not active
    let warningMessage = `Start campaign "${campaignData.title}" and send ${selectedStudents.length} emails`;

    if (!selectedEmail.isActive) {
      warningMessage += `\n\n⚠️ WARNING: The email "${selectedEmail.email}" is NOT active.\nEmails may fail to send.`;
    } else {
      warningMessage += ` from ${selectedEmail.email}`;
    }

    // Add certificate type to warning
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

    // Debug logging
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

    // Final warning for inactive email
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
        type: campaignData.type, // Now sends correct type (COURSE_CERTIFICATE or INTERNSHIP_CERTIFICATE)
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

        // Show success animation
        if (window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        // Reset form with new auto-generated name
        setTimeout(() => {
          setStep(1);
          setSelectedStudents([]);
          setCampaignData({
            title: generateCampaignName(),
            type: "COURSE_CERTIFICATE", // Reset to default
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

    // Additional validation for sender email
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

    // Check if email is active
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
        type: campaignData.type, // Now sends correct type
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

  // Student management functions
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

        // Update the student in selectedStudents list with success animation
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

        // Clear animation after 2 seconds
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

  // Debug function to check current state
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

  // Render Email Configuration Section
  const renderEmailConfigSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-gray-800">
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
            className="border-green-600 text-green-600"
          >
            Generate Gmail App Password
          </Button>
          <Button
            onClick={() => setShowEmailForm(true)}
            variant="outline"
            size="small"
            icon="fas fa-plus"
            className="border-green-600 text-green-600"
          >
            Add Email
          </Button>
        </div>
      </div>

      {emailConfigs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <i className="fas fa-envelope text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-600 mb-2">No email configurations found</p>
          <p className="text-sm text-gray-500 mb-4">
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
          {/* Sender Email Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Sender Email *
              </label>
              <span className="text-xs text-gray-500">
                Active email:{" "}
                {emailConfigs.find((e) => e.isActive)?.email || "None"}
              </span>
            </div>
            <select
              value={campaignData.senderEmailId || ""}
              onChange={handleSenderEmailChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <span className="text-gray-600 mr-2">Selected:</span>
                  <span className="font-medium">
                    {
                      emailConfigs.find(
                        (e) => e._id === campaignData.senderEmailId,
                      )?.email
                    }
                  </span>
                  {emailConfigs.find(
                    (e) => e._id === campaignData.senderEmailId,
                  )?.isActive ? (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check mr-1"></i> Active
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <i className="fas fa-exclamation-triangle mr-1"></i> Not
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-blue-600">
                  <i className="fas fa-info-circle mr-1"></i>
                  All emails will be sent from this address
                </div>
              </div>
            )}
          </div>

          {/* Email Configurations List - Added missing section */}
          <div className="mt-4 border-t pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Configured Emails ({emailConfigs.length})
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {emailConfigs.map((config) => (
                <div
                  key={config._id}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    config.isActive
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        config.isActive ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <i
                        className={`fas fa-envelope ${
                          config.isActive ? "text-green-600" : "text-gray-500"
                        }`}
                      ></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium flex items-center">
                        {config.email}
                        {config.isActive && (
                          <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {config.provider}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleTestEmail(config)}
                      disabled={testingEmail === config._id}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
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
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
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
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
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

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Email Configuration Section */}
            {renderEmailConfigSection()}

            {/* Student Selection */}
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Email Content
              </h4>

              <div className="grid grid-cols-1 gap-6">
                {/* NEW: Certificate Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Type *
                  </label>
                  <select
                    name="type"
                    value={campaignData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="COURSE_CERTIFICATE">
                      Course Completion Certificate
                    </option>
                    <option value="INTERNSHIP_CERTIFICATE">
                      Internship Certificate
                    </option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the type of certificate to generate and send
                  </p>
                </div>

                {/* Mail Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Mail Template
                  </label>
                  <div className="flex gap-3 items-start">
                    <select
                      value={campaignData.mailTemplateId || ""}
                      onChange={handleMailTemplateChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="whitespace-nowrap"
                    >
                      Manage Mail Templates
                    </Button>
                  </div>
                  {campaignData.mailTemplateId && (
                    <div className="mt-2 text-xs text-green-600">
                      <i className="fas fa-check-circle mr-1"></i>
                      Template selected
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={campaignData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Your Certificate is Ready!"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body *
                  </label>
                  <textarea
                    name="body"
                    value={campaignData.body}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Dear {name}, ..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Available placeholders: {"{name}"}, {"{program}"},{" "}
                    {"{course}"}, {"{batch}"}, {"{finalMark}"},{" "}
                    {"{completionDate}"}, {"{uniqueId}"}, {"{certificateId}"}
                  </div>
                </div>

                {/* Certificate Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Template *
                  </label>
                  <div className="flex gap-3 items-start">
                    <select
                      value={campaignData.certificateTemplateId || ""}
                      onChange={handleCertificateTemplateChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      className="whitespace-nowrap border-purple-600 text-purple-600"
                    >
                      Manage Certi Templates
                    </Button>
                  </div>
                  {campaignData.certificateTemplateId && (
                    <div className="mt-2 text-xs text-purple-600">
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

        // Get certificate type display name
        const getCertificateTypeDisplay = () => {
          if (campaignData.type === "COURSE_CERTIFICATE") {
            return "Course Completion Certificate";
          } else if (campaignData.type === "INTERNSHIP_CERTIFICATE") {
            return "Internship Certificate";
          }
          return "Certificate";
        };

        // Get certificate type icon
        const getCertificateTypeIcon = () => {
          return campaignData.type === "COURSE_CERTIFICATE"
            ? "fa-graduation-cap"
            : "fa-briefcase";
        };

        // Get certificate type color
        const getCertificateTypeColor = () => {
          return campaignData.type === "COURSE_CERTIFICATE"
            ? "text-blue-600"
            : "text-green-600";
        };

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Review & Send Campaign
              </h4>

              <div className="space-y-4">
                {/* Campaign Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600">Campaign</div>
                    <div className="text-lg font-semibold truncate">
                      {campaignData.title}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      Auto-generated
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600">Recipients</div>
                    <div className="text-lg font-semibold">
                      {selectedStudents.length} students
                    </div>
                  </div>
                  <div
                    className={`${campaignData.type === "COURSE_CERTIFICATE" ? "bg-blue-50" : "bg-green-50"} p-4 rounded-lg`}
                  >
                    <div
                      className={`text-sm ${campaignData.type === "COURSE_CERTIFICATE" ? "text-blue-600" : "text-green-600"}`}
                    >
                      Type
                    </div>
                    <div className="text-lg font-semibold flex items-center">
                      <i
                        className={`fas ${getCertificateTypeIcon()} mr-2 ${getCertificateTypeColor()}`}
                      ></i>
                      {getCertificateTypeDisplay()}
                    </div>
                    <div
                      className={`text-xs ${campaignData.type === "COURSE_CERTIFICATE" ? "text-blue-500" : "text-green-500"} mt-1`}
                    >
                      PDF attachment included
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${selectedEmail?.isActive ? "bg-yellow-50" : "bg-red-50"}`}
                  >
                    <div
                      className={`text-sm ${selectedEmail?.isActive ? "text-yellow-600" : "text-red-600"}`}
                    >
                      Sender
                    </div>
                    <div className="text-lg font-semibold">
                      {selectedEmail?.email || "Not selected"}
                    </div>
                    <div
                      className={`text-xs mt-1 ${selectedEmail?.isActive ? "text-yellow-500" : "text-red-500"}`}
                    >
                      {selectedEmail?.isActive ? "Active ✓" : "NOT ACTIVE ⚠️"}
                    </div>
                  </div>
                </div>

                {/* Certificate Type Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Certificate Details
                  </h5>
                  <div
                    className={`flex items-center p-3 rounded-lg ${campaignData.type === "COURSE_CERTIFICATE" ? "bg-blue-50 border border-blue-200" : "bg-green-50 border border-green-200"}`}
                  >
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${campaignData.type === "COURSE_CERTIFICATE" ? "bg-blue-100" : "bg-green-100"}`}
                    >
                      <i
                        className={`fas ${getCertificateTypeIcon()} ${campaignData.type === "COURSE_CERTIFICATE" ? "text-blue-600" : "text-green-600"}`}
                      ></i>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {getCertificateTypeDisplay()}
                      </div>
                      <div
                        className={`text-sm ${campaignData.type === "COURSE_CERTIFICATE" ? "text-blue-600" : "text-green-600"}`}
                      >
                        {campaignData.type === "COURSE_CERTIFICATE"
                          ? "Format: CNTTCPP + YY + 5-digit serial (e.g., CNTTCPP2500001)"
                          : "Format: UDYAM-<STATE>-<BRANCH>-7-digit serial (e.g., UDYAM-TN-02-0000001)"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {campaignData.type === "COURSE_CERTIFICATE"
                          ? "Course Completion Certificate ID will be generated and stored permanently"
                          : "Internship Certificate ID will be generated and stored permanently"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sender Email Info */}
                {selectedEmail && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Sender Information
                    </h5>
                    <div
                      className={`flex items-center p-3 rounded-lg ${selectedEmail.isActive ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                    >
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${selectedEmail.isActive ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {selectedEmail.isActive ? (
                          <i className="fas fa-check text-green-600"></i>
                        ) : (
                          <i className="fas fa-exclamation-triangle text-red-600"></i>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {selectedEmail.email}
                          {selectedEmail.isActive ? (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-check mr-1"></i> Active
                            </span>
                          ) : (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <i className="fas fa-exclamation-triangle mr-1"></i>{" "}
                              Not Active
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm ${selectedEmail.isActive ? "text-green-600" : "text-red-600"}`}
                        >
                          {selectedEmail.isActive
                            ? "All emails will be sent from this address"
                            : "⚠️ Emails may fail to send. Activate this email first."}
                        </div>
                        {!selectedEmail.isActive && (
                          <Button
                            onClick={() =>
                              handleSetActiveEmail(selectedEmail._id)
                            }
                            variant="outline"
                            size="extra-small"
                            className="mt-2 border-red-600 text-red-600 hover:bg-red-50"
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

                {/* Email Preview */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Email Preview
                  </h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-semibold text-gray-800 mb-2">
                      Subject: {campaignData.subject}
                    </div>
                    <div className="text-gray-600 whitespace-pre-line bg-white p-3 rounded">
                      {campaignData.body}
                    </div>
                  </div>
                </div>

                {/* Certificate Preview */}
                {campaignData.certificateTemplateId && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Certificate Included
                    </h5>
                    <div
                      className={`flex items-center ${campaignData.type === "COURSE_CERTIFICATE" ? "text-blue-600 bg-blue-50" : "text-green-600 bg-green-50"} p-3 rounded-lg`}
                    >
                      <i
                        className={`fas ${getCertificateTypeIcon()} text-xl mr-3`}
                      ></i>
                      <div>
                        <div className="font-medium">
                          {getCertificateTypeDisplay()} (PDF)
                        </div>
                        <div
                          className={`text-sm ${campaignData.type === "COURSE_CERTIFICATE" ? "text-blue-500" : "text-green-500"}`}
                        >
                          Template:{" "}
                          {certificateTemplates.find(
                            (t) => t._id === campaignData.certificateTemplateId,
                          )?.originalName || "Selected"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Warning for Inactive Email */}
                {selectedEmail && !selectedEmail.isActive && (
                  <div className="border-t border-red-200 pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <i className="fas fa-exclamation-triangle text-red-600 mr-3 text-xl"></i>
                        <div>
                          <div className="font-medium text-red-800">
                            ⚠️ IMPORTANT: Email is Not Active
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            The selected email "{selectedEmail.email}" is not
                            active. Emails will likely fail to send. Please
                            activate it first.
                          </div>
                          <Button
                            onClick={() =>
                              handleSetActiveEmail(selectedEmail._id)
                            }
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

                {/* Editable Student List */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      Selected Students ({selectedStudents.length})
                    </h5>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                        size="small"
                        icon="fas fa-user-plus"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
                        className="border-green-600 text-green-600 hover:bg-green-50"
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

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedStudents.map((student) => (
                        <div
                          key={student._id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                            student._updated
                              ? "border-green-300 bg-green-50"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {updatingStudent === student._id ? (
                                <i className="fas fa-spinner fa-spin text-blue-600"></i>
                              ) : student._updated ? (
                                <i className="fas fa-check text-green-600"></i>
                              ) : (
                                <i className="fas fa-user text-blue-600"></i>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                                <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                                  {student.uniqueId}
                                </span>
                                {updatingStudent === student._id && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    Updating...
                                  </span>
                                )}
                                {student._updated && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                                    <i className="fas fa-check mr-1"></i>
                                    Updated!
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
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
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
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
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
        <h2 className="text-xl font-bold text-gray-800">Bulk Email Campaign</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">Step {step} of 3</div>
          <button
            onClick={debugCurrentState}
            className="ml-4 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
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
                  step >= stepNumber ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {stepNumber === 1 && "Setup & Select"}
                {stepNumber === 2 && "Email Content"}
                {stepNumber === 3 && "Review & Send"}
              </div>
              {stepNumber < 3 && (
                <div className="ml-4 h-0.5 w-12 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div>
          {step > 1 && (
            <Button
              onClick={handlePrevStep}
              variant="outline"
              icon="fas fa-arrow-left"
              className="border-gray-300"
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
                        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                        .preview-container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        h2 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                        .email-body { border: 1px solid #ddd; padding: 20px; margin: 20px 0; white-space: pre-line; line-height: 1.6; }
                        .placeholder { background: #f0f9ff; color: #0369a1; padding: 2px 5px; border-radius: 3px; }
                        .footer { color: #666; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
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
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
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

      {/* Student Form Modal */}
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

      {/* Add Email Configuration Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form
                onSubmit={handleAddEmailConfig}
                className="space-y-4"
                autoComplete="off"
              >
                {/* Hidden fields to prevent Chrome autofill */}
                <input
                  type="text"
                  name="fakeuser"
                  style={{ display: "none" }}
                />
                <input
                  type="password"
                  name="fakepass"
                  style={{ display: "none" }}
                />

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={emailFormData.email}
                    onChange={handleEmailFormChange}
                    placeholder="your-email@gmail.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* App Password - Auto removes spaces */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Password *
                  </label>

                  <div className="relative">
                    <input
                      type={showAppPassword ? "text" : "password"}
                      name="appPassword"
                      autoComplete="new-password"
                      value={emailFormData.appPassword}
                      onChange={(e) => {
                        // Remove all spaces from input
                        const noSpaces = e.target.value.replace(/\s/g, "");
                        handleEmailFormChange({
                          target: {
                            name: "appPassword",
                            value: noSpaces,
                          },
                        });
                      }}
                      onPaste={(e) => {
                        // Remove spaces from pasted content
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />

                    {/* Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowAppPassword(!showAppPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <i
                        className={`fas ${
                          showAppPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Enter your 16-character app password (spaces will be removed
                    automatically)
                  </p>
                </div>

                {/* Email Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Provider
                  </label>
                  <select
                    name="provider"
                    value={emailFormData.provider}
                    onChange={handleEmailFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                    <option value="yahoo">Yahoo</option>
                    <option value="custom">Custom SMTP</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-gray-200">
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
                      className="border-gray-300"
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

// Helper function for certificate type display (used in preview)
const getCertificateTypeDisplay = (type) => {
  if (type === "COURSE_CERTIFICATE") {
    return "Course Completion Certificate";
  } else if (type === "INTERNSHIP_CERTIFICATE") {
    return "Internship Certificate";
  }
  return "Certificate";
};

export default BulkEmailCampaign;
