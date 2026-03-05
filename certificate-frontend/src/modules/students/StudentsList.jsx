// src/modules/students/StudentsList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { studentAPI } from "../../api/students";
import bulkUploadAPI from "../../api/bulkUpload";
import { batchAPI } from "../../api/batches";
import { courseAPI } from "../../api/courses";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/Button";
import StudentCard from "./StudentCard";
import StudentsTable from "./StudentsTable";
import StudentForm from "./StudentForm";
import BulkUploadModal from "./BulkUploadModal";
import StudentEmailModal from "./StudentEmailModal";
import { useToast } from "../../hooks/useToast";
import { useTheme } from "../../context/ThemeContext";

import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const StudentsList = () => {
  const { isDarkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [contactStudent, setContactStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Delete All Students State
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    const batchIdFromURL = searchParams.get("batchId");
    const batchNameFromURL = searchParams.get("batchName");
    const courseIdFromURL = searchParams.get("courseId");
    const courseNameFromURL = searchParams.get("courseName");

    if (batchIdFromURL) {
      setBatchFilter(batchIdFromURL);
      if (batchNameFromURL) {
        setSelectedBatch({
          _id: batchIdFromURL,
          batchName: decodeURIComponent(batchNameFromURL),
        });
      }
    }

    if (courseIdFromURL) {
      setCourseFilter(courseIdFromURL);
      if (courseNameFromURL) {
        setSelectedCourse({
          _id: courseIdFromURL,
          courseName: decodeURIComponent(courseNameFromURL),
        });
      }
    }

    fetchBatches();
    fetchCourses();
  }, [searchParams]);

  useEffect(() => {
    fetchStudents();
  }, [batchFilter, courseFilter, searchTerm]);

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAllBatches();
      if (response.success) {
        const activeBatches = response.data.filter((batch) => batch.isActive);
        setBatches(activeBatches);
      }
    } catch (error) {
      showToast("Error fetching batches", "error");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      if (response.success) {
        const activeCourses = response.data.filter((course) => course.isActive);
        setCourses(activeCourses);
      }
    } catch (error) {
      showToast("Error fetching courses", "error");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchTerm) params.search = searchTerm;
      if (batchFilter !== "all") params.batchId = batchFilter;
      if (courseFilter !== "all") params.courseId = courseFilter;

      const response = await studentAPI.getAllStudents(params);
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      showToast("Error fetching students", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const response = await bulkUploadAPI.getUploadHistory();
      if (response.success) {
        setUploadHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching upload history:", error);
    }
  };

  const handleDeleteAllStudents = async () => {
    if (students.length === 0) {
      showToast("No students to delete", "warning");
      setShowDeleteAllConfirm(false);
      return;
    }

    setIsDeletingAll(true);
    try {
      const params = {};

      if (searchTerm) params.search = searchTerm;
      if (batchFilter !== "all") params.batchId = batchFilter;
      if (courseFilter !== "all") params.courseId = courseFilter;

      console.log("Deleting students with filters:", params);

      const response = await studentAPI.deleteFilteredStudents(params);

      if (response.success) {
        showToast(
          `Successfully deleted ${response.data?.deletedCount || students.length} student(s)`,
          "success",
        );
        setShowDeleteAllConfirm(false);
        fetchStudents();
      } else {
        showToast(response.message || "Failed to delete students", "error");
      }
    } catch (error) {
      console.error("Delete filtered students error:", error);
      showToast(error.message || "Error deleting students", "error");
    } finally {
      setIsDeletingAll(false);
    }
  };

  // PDF Generation Function
  const downloadStudentsPDF = () => {
    if (students.length === 0) {
      showToast("No students to download", "warning");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(20);
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.setFont("helvetica", "bold");
      doc.text("STUDENTS LIST", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      doc.setFont("helvetica", "normal");
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated on: ${date}`, 14, 28);

      let filtersText = "Filters: ";
      if (selectedBatch) filtersText += `Batch: ${selectedBatch.batchName} `;
      if (selectedCourse)
        filtersText += `Course: ${selectedCourse.courseName} `;
      if (searchTerm) filtersText += `Search: "${searchTerm}" `;
      if (!selectedBatch && !selectedCourse && !searchTerm)
        filtersText += "All students";

      doc.setFontSize(9);
      doc.text(filtersText, 14, 35);

      const tableData = students.map((student, index) => [
        index + 1,
        student.name || "N/A",
        student.email || "N/A",
        student.uniqueId || "N/A",
        student.batchId?.batchName || "N/A",
        student.enrolledCourseIds?.map((c) => c.courseName).join(", ") || "N/A",
        student.finalMark ? `${student.finalMark}%` : "N/A",
        student.completionDate
          ? new Date(student.completionDate).toLocaleDateString()
          : "Not completed",
        student.status || "Active",
      ]);

      autoTable(doc, {
        startY: 45,
        head: [
          [
            "#",
            "Name",
            "Email",
            "Student ID",
            "Batch",
            "Courses",
            "Mark",
            "Completion Date",
            "Status",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: isDarkMode ? [60, 60, 60] : [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 40 },
          6: { cellWidth: 15 },
          7: { cellWidth: 25 },
          8: { cellWidth: 20 },
        },
        margin: { left: 14, right: 14 },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.text("SUMMARY", 14, finalY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      doc.text(
        [
          `Total Students: ${students.length}`,
          `With Marks: ${stats.withMarks}`,
          `Completed: ${stats.completed}`,
          `Average Mark: ${stats.avgMark}%`,
        ],
        14,
        finalY + 8,
      );

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10,
        );
      }

      const fileName = `Students_List_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      showToast("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Failed to generate PDF", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadStudentsCSV = () => {
    if (students.length === 0) {
      showToast("No students to download", "warning");
      return;
    }

    try {
      const headers = [
        "Name",
        "Email",
        "Student ID",
        "Batch",
        "Courses",
        "Mark",
        "Completion Date",
        "Status",
        "Phone",
        "Address",
      ];

      const rows = students.map((student) => [
        student.name || "",
        student.email || "",
        student.uniqueId || "",
        student.batchId?.batchName || "",
        student.enrolledCourseIds?.map((c) => c.courseName).join(", ") || "",
        student.finalMark || "",
        student.completionDate
          ? new Date(student.completionDate).toLocaleDateString()
          : "",
        student.status || "",
        student.phone || "",
        student.address || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Students_List_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("CSV downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating CSV:", error);
      showToast("Failed to generate CSV", "error");
    }
  };

  const handleDownload = () => {
    downloadStudentsPDF();
  };

  const handleCreateStudent = async (studentData) => {
    try {
      const response = await studentAPI.createStudent(studentData);
      if (response.success) {
        showToast("Student created successfully", "success");
        setShowForm(false);
        fetchStudents();
      } else {
        showToast(response.message || "Failed to create student", "error");
      }
    } catch (error) {
      console.error("Create student error:", error);
      showToast(error.message || "Error creating student", "error");
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleUpdateStudent = async (studentId, updatedData) => {
    try {
      const response = await studentAPI.updateStudent(studentId, updatedData);
      if (response.success) {
        showToast("Student updated successfully", "success");
        setShowForm(false);
        setEditingStudent(null);
        fetchStudents();
      }
    } catch (error) {
      showToast("Error updating student", "error");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this student? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await studentAPI.deleteStudent(studentId);
      if (response.success) {
        showToast("Student deleted successfully", "success");
        fetchStudents();
      }
    } catch (error) {
      showToast("Error deleting student", "error");
    }
  };

  const handleContactStudent = (student) => {
    setContactStudent(student);
    setShowEmailModal(true);
  };

  const handleBulkUpload = async (formData) => {
    try {
      const response = await bulkUploadAPI.uploadStudents(formData);
      if (response.success) {
        showToast("File uploaded successfully. Processing...", "success");
        setShowBulkUpload(false);
        fetchUploadHistory();
        setTimeout(() => fetchStudents(), 3000);
      }
    } catch (error) {
      showToast("Error uploading file", "error");
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await bulkUploadAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Template downloaded successfully", "success");
    } catch (error) {
      showToast("Error downloading template", "error");
    }
  };

  const clearFilters = () => {
    setBatchFilter("all");
    setCourseFilter("all");
    setSelectedBatch(null);
    setSelectedCourse(null);
    setSearchTerm("");

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("batchId");
    newSearchParams.delete("batchName");
    newSearchParams.delete("courseId");
    newSearchParams.delete("courseName");
    navigate({ search: newSearchParams.toString() });
  };

  const getStats = () => {
    const totalStudents = students.length;
    const withMarks = students.filter((s) => s.finalMark).length;
    const avgMark =
      withMarks > 0
        ? (
            students.reduce((sum, s) => sum + (s.finalMark || 0), 0) / withMarks
          ).toFixed(1)
        : 0;

    const completed = students.filter((s) => s.completionDate).length;

    return { totalStudents, withMarks, avgMark, completed };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Students Management
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage student enrollments and academic records
          </p>

          {(selectedBatch || selectedCourse) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {selectedBatch && (
                <span className={`inline-flex items-center text-sm px-3 py-1 rounded-full border ${
                  isDarkMode 
                    ? 'text-blue-300 bg-blue-900/20 border-blue-800' 
                    : 'text-blue-600 bg-blue-50 border-blue-200'
                }`}>
                  <i className="fas fa-filter mr-1"></i>
                  Batch: {selectedBatch.batchName}
                </span>
              )}
              {selectedCourse && (
                <span className={`inline-flex items-center text-sm px-3 py-1 rounded-full border ${
                  isDarkMode 
                    ? 'text-green-300 bg-green-900/20 border-green-800' 
                    : 'text-green-600 bg-green-50 border-green-200'
                }`}>
                  <i className="fas fa-filter mr-1"></i>
                  Course: {selectedCourse.courseName}
                </span>
              )}
              <button
                onClick={clearFilters}
                className={`inline-flex items-center text-sm px-2 py-1 rounded transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Clear filters"
              >
                <i className="fas fa-times mr-1"></i>
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* View Mode Toggle */}
          <div className={`flex rounded-lg border p-1 shadow-sm ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                viewMode === "table"
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-800 shadow-sm'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <i className="fas fa-table text-base"></i>
              <span className="hidden sm:inline text-sm font-medium">
                Table
              </span>
            </button>

            <button
              onClick={() => setViewMode("card")}
              className={`p-2.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                viewMode === "card"
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-800 shadow-sm'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Card View"
            >
              <i className="fas fa-th-large text-base"></i>
              <span className="hidden sm:inline text-sm font-medium">
                Cards
              </span>
            </button>
          </div>

          {/* Delete All Button - Only show when there are students */}
          {students.length > 0 && (
            <Button
              onClick={() => setShowDeleteAllConfirm(true)}
              variant="outline"
              icon="fas fa-trash-alt"
              size="medium"
              className={isDarkMode
                ? 'bg-red-900/20 border-red-800 hover:bg-red-900/30 text-red-300 hover:text-red-200 hover:border-red-700'
                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-800 hover:border-red-300'
              }
              title="Delete all students"
            >
              <span className="hidden sm:inline">Delete All</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          )}

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            variant="outline"
            icon={
              isGeneratingPDF ? "fas fa-spinner fa-spin" : "fas fa-download"
            }
            size="medium"
            disabled={students.length === 0 || isGeneratingPDF}
            className={isDarkMode
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200 hover:text-white'
              : 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 hover:text-emerald-800 hover:border-emerald-300'
            }
          >
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>

          <Button
            onClick={() => setShowBulkUpload(true)}
            variant="outline"
            icon="fas fa-upload"
            size="medium"
            disabled={batches.length === 0}
            className={isDarkMode
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200 hover:text-white'
              : ''
            }
          >
            <span className="hidden sm:inline">Bulk Upload</span>
            <span className="sm:hidden">Upload</span>
          </Button>

          <Button
            onClick={() => {
              setEditingStudent(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            disabled={batches.length === 0}
            icon="fas fa-plus"
            size="medium"
          >
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className={`fixed inset-0 transition-opacity ${
                isDarkMode ? 'bg-gray-900 opacity-90' : 'bg-gray-500 opacity-75'
              }`}
              aria-hidden="true"
              onClick={() => !isDeletingAll && setShowDeleteAllConfirm(false)}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    <i className={`fas fa-exclamation-triangle text-xl ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}></i>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg leading-6 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Delete All Students
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Are you sure you want to delete all{" "}
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {students.length}
                        </span>{" "}
                        students? This action cannot be undone and will
                        permanently remove all student records, including their
                        enrollment history and academic data.
                      </p>
                    </div>

                    <div className={`mt-4 p-3 rounded-md border ${
                      isDarkMode 
                        ? 'bg-red-900/20 border-red-800' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-xs flex items-start ${
                        isDarkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        <i className="fas fa-info-circle mr-2 mt-0.5"></i>
                        <span>
                          This will also delete associated email logs and
                          certificate records. Please make sure you have a
                          backup if needed.
                        </span>
                      </p>
                    </div>

                    {(selectedBatch || selectedCourse || searchTerm) && (
                      <div className={`mt-4 p-3 rounded-md border ${
                        isDarkMode 
                          ? 'bg-yellow-900/20 border-yellow-800' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <p className={`text-xs flex items-start ${
                          isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                        }`}>
                          <i className="fas fa-filter mr-2 mt-0.5"></i>
                          <span>
                            Active filters detected. This will delete ALL
                            students, not just filtered ones.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Button
                  onClick={handleDeleteAllStudents}
                  variant="danger"
                  className="w-full sm:w-auto"
                  disabled={isDeletingAll}
                  icon={
                    isDeletingAll
                      ? "fas fa-spinner fa-spin"
                      : "fas fa-trash-alt"
                  }
                >
                  {isDeletingAll
                    ? "Deleting..."
                    : `Delete ${students.length} Students`}
                </Button>
                <Button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  variant="secondary"
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                  disabled={isDeletingAll}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={`p-5 rounded-xl border shadow-sm ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search Students
            </label>
            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className={`
                  block w-full rounded-xl border-2 px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                `}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className={`fas fa-search ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Batch Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Filter by Batch
            </label>
            <div className="relative">
              <select
                value={batchFilter}
                onChange={(e) => {
                  setBatchFilter(e.target.value);
                  const selected = batches.find(
                    (b) => b._id === e.target.value,
                  );
                  setSelectedBatch(selected || null);
                }}
                className={`
                  block w-full rounded-xl border-2 px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white/80 border-gray-300 text-gray-900'
                  }
                `}
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
              </div>
            </div>
          </div>

          {/* Course Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Filter by Course
            </label>
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  const selected = courses.find(
                    (c) => c._id === e.target.value,
                  );
                  setSelectedCourse(selected || null);
                }}
                className={`
                  block w-full rounded-xl border-2 px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white/80 border-gray-300 text-gray-900'
                  }
                `}
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <Button
              onClick={() => fetchStudents()}
              variant="outline"
              icon="fas fa-sync-alt"
              className={`flex-1 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' 
                  : ''
              }`}
            >
              Refresh
            </Button>
            {(searchTerm ||
              batchFilter !== "all" ||
              courseFilter !== "all") && (
              <Button
                onClick={clearFilters}
                variant="secondary"
                icon="fas fa-times"
                className="px-4"
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active filters notification */}
        {(selectedBatch || selectedCourse || searchTerm) && (
          <div className={`mt-4 p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-filter text-white"></i>
                </div>
                <div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    Active filters:
                    {searchTerm && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {selectedBatch && (
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        Batch: {selectedBatch.batchName}
                      </span>
                    )}
                    {selectedCourse && (
                      <span className="ml-2 text-purple-600 dark:text-purple-400">
                        Course: {selectedCourse.courseName}
                      </span>
                    )}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Showing {students.length} students
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Click "Download PDF" to export this filtered list
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Students Content */}
      {loading ? (
        <LoadingSkeleton
          type={viewMode === "card" ? "card" : "table"}
          count={6}
        />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            searchTerm || batchFilter !== "all" || courseFilter !== "all"
              ? "Try changing your search or filters"
              : batches.length === 0
                ? "No active batches available. Create a batch first."
                : "Add your first student to get started"
          }
          icon="fas fa-users"
          actionText={batches.length === 0 ? "Create Batch" : "Add Student"}
          onAction={() => {
            if (batches.length === 0) {
              showToast("Please create a batch first", "info");
              navigate("/batches");
            } else {
              setEditingStudent(null);
              setShowForm(true);
            }
          }}
        />
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onContact={handleContactStudent}
            />
          ))}
        </div>
      ) : (
        <StudentsTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onContact={handleContactStudent}
          ref={tableRef}
        />
      )}

      {/* Student Form Modal */}
      {showForm && (
        <StudentForm
          onSubmit={
            editingStudent
              ? (data) => handleUpdateStudent(editingStudent._id, data)
              : handleCreateStudent
          }
          onClose={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          initialData={editingStudent}
          batches={batches}
          courses={courses}
          title={editingStudent ? "Edit Student" : "Add New Student"}
          defaultBatchId={batchFilter !== "all" ? batchFilter : undefined}
          defaultCourseIds={courseFilter !== "all" ? [courseFilter] : undefined}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onUploadSuccess={() => {
            fetchStudents();
            fetchUploadHistory();
          }}
          onDownloadTemplate={downloadTemplate}
          batches={batches}
          courses={courses}
          uploadHistory={uploadHistory}
          defaultBatchId={batchFilter !== "all" ? batchFilter : undefined}
          defaultCourseIds={courseFilter !== "all" ? [courseFilter] : undefined}
        />
      )}

      {/* Student Email Modal */}
      {showEmailModal && contactStudent && (
        <StudentEmailModal
          student={contactStudent}
          onClose={() => {
            setShowEmailModal(false);
            setContactStudent(null);
          }}
          onSuccess={() => {
            fetchStudents();
          }}
        />
      )}
    </div>
  );
};

export default StudentsList;