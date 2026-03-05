// src/modules/batches/BatchesList.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { batchAPI } from "../../api/batches";
import { courseAPI } from "../../api/courses";
import { programAPI } from "../../api/programs";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/Button";
import BatchForm from "./BatchForm";
import BatchTable from "./BatchTable";
import BatchCard from "./BatchCard";
import { useToast } from "../../hooks/useToast";
import { useTheme } from "../../context/ThemeContext";

// Import PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BatchesList = () => {
  const { isDarkMode } = useTheme();
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const programIdFromURL = searchParams.get("programId");
    const programNameFromURL = searchParams.get("programName");

    if (programIdFromURL) {
      setProgramFilter(programIdFromURL);

      if (programNameFromURL) {
        setSelectedProgram({
          _id: programIdFromURL,
          programName: decodeURIComponent(programNameFromURL),
        });
      } else {
        fetchProgramInfo(programIdFromURL);
      }
    }
  }, [searchParams]);

  // Fetch programs first (needed for batch creation)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch programs (REQUIRED for batch creation)
        const programsResponse = await programAPI.getAllPrograms();
        if (programsResponse.success) {
          // Filter only active programs
          const activePrograms = programsResponse.data.filter(
            (program) => program.isActive,
          );
          setPrograms(activePrograms);
        }

        // 2. Fetch courses (optional - for filtering and course counts)
        const coursesResponse = await courseAPI.getAllCourses();
        if (coursesResponse.success) {
          const activeCourses = coursesResponse.data.filter(
            (course) => course.isActive,
          );
          setCourses(activeCourses);
        }

        // 3. Fetch batches (can be fetched independently of courses)
        await fetchBatches();
        
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showToast("Error fetching data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch batches when filters change
  useEffect(() => {
    fetchBatches();
  }, [courseFilter, statusFilter, searchTerm, programFilter]);

  const fetchProgramInfo = async (programId) => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        const program = response.data.find((p) => p._id === programId);
        if (program) {
          setSelectedProgram(program);
        }
      }
    } catch (error) {
      console.error("Error fetching program info:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (courseFilter !== "all") params.courseId = courseFilter;
      if (programFilter !== "all") params.programId = programFilter;
      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active";
      }

      const response = await batchAPI.getAllBatches(params);
      if (response.success) {
        // Fetch REAL course counts for each batch
        const batchesWithRealCourseCounts = await Promise.all(
          response.data.map(async (batch) => {
            try {
              // Get courses for this specific batch
              const coursesResponse = await courseAPI.getAllCourses({
                batchId: batch._id,
              });

              let courseCount = 0;
              if (coursesResponse.success) {
                // Count active courses only
                courseCount = coursesResponse.data.filter(
                  (course) => course.isActive,
                ).length;
              }

              return {
                ...batch,
                courseCount,
              };
            } catch (error) {
              console.error(
                `Error fetching courses for batch ${batch._id}:`,
                error,
              );
              return { ...batch, courseCount: 0 };
            }
          }),
        );

        setBatches(batchesWithRealCourseCounts);
      }
    } catch (error) {
      showToast("Error fetching batches", "error");
    } finally {
      setLoading(false);
    }
  };

  // PDF Generation Function
  const downloadBatchesPDF = () => {
    if (filteredBatches.length === 0) {
      showToast("No batches to download", "warning");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.setFont("helvetica", "bold");
      doc.text("BATCHES LIST", 14, 20);

      // Add subtitle
      doc.setFontSize(12);
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      doc.setFont("helvetica", "normal");
      if (selectedProgram) {
        doc.text(`Program: ${selectedProgram.programName}`, 14, 28);
      }

      // Add date
      doc.setFontSize(10);
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated on: ${date}`, 14, 36);

      // Add filters info
      let filtersText = "Filters: ";
      if (selectedProgram)
        filtersText += `Program: ${selectedProgram.programName} `;
      if (courseFilter !== "all") {
        const course = courses.find((c) => c._id === courseFilter);
        if (course) filtersText += `Course: ${course.courseName} `;
      }
      if (statusFilter !== "all")
        filtersText += `Status: ${statusFilter === "active" ? "Active" : "Inactive"} `;
      if (searchTerm) filtersText += `Search: "${searchTerm}" `;
      if (
        !selectedProgram &&
        courseFilter === "all" &&
        statusFilter === "all" &&
        !searchTerm
      ) {
        filtersText += "All batches";
      }

      doc.setFontSize(9);
      doc.text(filtersText, 14, 44);

      // Prepare table data
      const tableData = filteredBatches.map((batch, index) => [
        index + 1,
        batch.batchCode || "N/A",
        batch.batchName,
        batch.courseId?.courseName || "N/A",
        batch.programId?.programName || "N/A",
        batch.courseCount || 0,
        batch.startDate
          ? new Date(batch.startDate).toLocaleDateString()
          : "Not set",
        batch.endDate
          ? new Date(batch.endDate).toLocaleDateString()
          : "Not set",
        batch.isActive ? "Active" : "Inactive",
        batch.totalStudents || 0,
      ]);

      // Add table
      autoTable(doc, {
        startY: 52,
        head: [
          [
            "#",
            "Code",
            "Batch Name",
            "Course",
            "Program",
            "Courses",
            "Start Date",
            "End Date",
            "Status",
            "Students",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [79, 70, 229], // Indigo color
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: isDarkMode ? [60, 60, 60] : [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 10 }, // #
          1: { cellWidth: 20 }, // Code
          2: { cellWidth: 30 }, // Batch Name
          3: { cellWidth: 25 }, // Course
          4: { cellWidth: 25 }, // Program
          5: { cellWidth: 15 }, // Courses
          6: { cellWidth: 20 }, // Start Date
          7: { cellWidth: 20 }, // End Date
          8: { cellWidth: 15 }, // Status
          9: { cellWidth: 15 }, // Students
        },
        margin: { left: 14, right: 14 },
      });

      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isDarkMode ? 200 : 40, isDarkMode ? 200 : 40, isDarkMode ? 200 : 40);
      doc.text("SUMMARY STATISTICS", 14, finalY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(isDarkMode ? 150 : 100, isDarkMode ? 150 : 100, isDarkMode ? 150 : 100);
      doc.text(
        [
          `Total Batches: ${batches.length}`,
          `Active Batches: ${stats.activeBatches}`,
          `Inactive Batches: ${stats.inactiveBatches}`,
          `Total Courses in Batches: ${stats.totalCourses}`,
        ],
        14,
        finalY + 8,
      );

      // Add page numbers
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

      // Save PDF
      const fileName = `Batches_List_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      showToast("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Failed to generate PDF", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCreateBatch = async (batchData) => {
    try {
      const response = await batchAPI.createBatch(batchData);
      if (response.success) {
        showToast("Batch created successfully", "success");
        setShowForm(false);
        await fetchBatches(); // Refresh the batches list
      }
    } catch (error) {
      showToast("Error creating batch", "error");
    }
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowForm(true);
  };

  const handleUpdateBatch = async (batchId, updatedData) => {
    try {
      const response = await batchAPI.updateBatch(batchId, updatedData);
      if (response.success) {
        showToast("Batch updated successfully", "success");
        setShowForm(false);
        setEditingBatch(null);
        fetchBatches();
      }
    } catch (error) {
      showToast("Error updating batch", "error");
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const response = await batchAPI.updateBatch(id, { isActive: newStatus });
      if (response.success) {
        showToast(
          `Batch ${newStatus ? "activated" : "deactivated"} successfully`,
          "success",
        );

        // Update the batch in state and refresh course count
        const updatedBatch = response.data;
        if (updatedBatch) {
          // Fetch updated course count for this batch
          const coursesResponse = await courseAPI.getAllCourses({
            batchId: id,
          });

          let courseCount = 0;
          if (coursesResponse.success) {
            courseCount = coursesResponse.data.filter(
              (course) => course.isActive,
            ).length;
          }

          setBatches((prevBatches) =>
            prevBatches.map((batch) =>
              batch._id === id
                ? {
                    ...batch,
                    isActive: newStatus,
                    courseCount,
                  }
                : batch,
            ),
          );
        }
      }
    } catch (error) {
      showToast("Error updating batch status", "error");
      fetchBatches();
    }
  };

  const handleViewCourses = (batchId, batchName) => {
    navigate(
      `/courses?batchId=${batchId}&batchName=${encodeURIComponent(batchName)}`,
    );
  };

  const handleCreateProgram = () => {
    navigate("/programs/create");
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchCode?.toLowerCase().includes(searchTerm.toLowerCase() || "");
    const matchesCourse =
      courseFilter === "all" || batch.courseId?._id === courseFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? batch.isActive : !batch.isActive);

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStats = () => {
    const activeBatches = batches.filter((b) => b.isActive).length;
    const inactiveBatches = batches.filter((b) => !b.isActive).length;
    const totalCourses = batches.reduce(
      (sum, batch) => sum + (batch.courseCount || 0),
      0,
    );
    return { activeBatches, inactiveBatches, totalCourses };
  };

  const clearProgramFilter = () => {
    setProgramFilter("all");
    setSelectedProgram(null);

    // Update URL without program filter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("programId");
    newSearchParams.delete("programName");
    navigate({ search: newSearchParams.toString() });
  };

  const stats = getStats();

  if (loading && batches.length === 0 && programs.length === 0) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {selectedProgram
              ? `${selectedProgram.programName} Batches`
              : "Batches"}
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {selectedProgram
              ? "Manage batches for this program"
              : "Manage all batches"}
          </p>

          {selectedProgram && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full border ${
                isDarkMode 
                  ? 'text-blue-300 bg-blue-900/20 border-blue-800' 
                  : 'text-blue-600 bg-blue-50 border-blue-200'
              }`}>
                <i className="fas fa-filter mr-1"></i>
                Filtered by Program: {selectedProgram.programName}
              </span>
              <button
                onClick={clearProgramFilter}
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Show all batches"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle - only show if we have batches */}
          {batches.length > 0 && (
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
              >
                <i className="fas fa-table text-base"></i>
                <span className="text-sm font-medium">Table</span>
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
              >
                <i className="fas fa-th-large text-base"></i>
                <span className="text-sm font-medium">Cards</span>
              </button>
            </div>
          )}

          {/* Download PDF Button */}
          {filteredBatches.length > 0 && (
            <Button
              onClick={downloadBatchesPDF}
              variant="outline"
              icon={
                isGeneratingPDF ? "fas fa-spinner fa-spin" : "fas fa-download"
              }
              size="medium"
              disabled={filteredBatches.length === 0 || isGeneratingPDF}
              className={isDarkMode
                ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200 hover:text-white hover:border-gray-500'
                : 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 hover:text-indigo-800 hover:border-indigo-300'
              }
            >
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
          )}

          <Button
            onClick={() => {
              if (programs.length === 0) {
                showToast("Please create a program first", "info");
                navigate("/programs/create");
              } else {
                setEditingBatch(null);
                setShowForm(true);
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            icon="fas fa-plus"
            size="medium"
          >
            Create Batch
          </Button>
        </div>
      </div>

      {/* Statistics Cards - only show if we have batches */}
      {batches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-layer-group text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Batches</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {batches.length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-emerald-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.activeBatches}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-pause-circle text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Inactive</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.inactiveBatches}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700' 
              : 'bg-gradient-to-br from-white to-purple-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Courses</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stats.totalCourses}
                </p>
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
              Search Batches
            </label>
            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
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

          {/* Course Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Course
            </label>
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
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

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`
                  block w-full rounded-xl border-2 px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white/80 border-gray-300 text-gray-900'
                  }
                `}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
              </div>
            </div>
          </div>

          {/* Program Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Program
            </label>
            <div className="relative">
              <select
                value={programFilter}
                onChange={(e) => {
                  const programId = e.target.value;
                  setProgramFilter(programId);

                  if (programId === "all") {
                    setSelectedProgram(null);
                  } else {
                    const program = programs.find((p) => p._id === programId);
                    setSelectedProgram(program || null);
                  }
                }}
                className={`
                  block w-full rounded-xl border-2 px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white/80 border-gray-300 text-gray-900'
                  }
                `}
              >
                <option value="all">All Programs</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.programName}
                  </option>
                ))}
              </select>

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Active program filter notification */}
        {selectedProgram && (
          <div className={`mt-4 p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-project-diagram text-white"></i>
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Showing batches for program:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {selectedProgram.programName}
                    </span>
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Only batches from courses in this program are displayed
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Click "Download PDF" to export this filtered list
                  </p>
                </div>
              </div>
              <button
                onClick={clearProgramFilter}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/30' 
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                }`}
              >
                <i className="fas fa-times mr-1"></i>
                Clear Program Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batches Content */}
      {programs.length === 0 ? (
        <EmptyState
          title="No Programs Available"
          description="You need to create a program before you can create batches. Programs are required to organize batches."
          icon="fas fa-project-diagram"
          actionText="Create Your First Program"
          onAction={handleCreateProgram}
        />
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          title={
            selectedProgram
              ? `No batches found for ${selectedProgram.programName}`
              : "No batches found"
          }
          description={
            searchTerm ||
            courseFilter !== "all" ||
            statusFilter !== "all" ||
            selectedProgram
              ? "Try changing your search or filters"
              : "Create your first batch to get started"
          }
          icon="fas fa-layer-group"
          actionText="Create Batch"
          onAction={() => {
            setEditingBatch(null);
            setShowForm(true);
          }}
        />
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch._id}
              batch={batch}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditBatch}
            />
          ))}
        </div>
      ) : (
        <BatchTable
          batches={filteredBatches}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditBatch}
        />
      )}

      {/* Batch Form Modal */}
      {showForm && (
        <BatchForm
          onSubmit={
            editingBatch
              ? (data) => handleUpdateBatch(editingBatch._id, data)
              : handleCreateBatch
          }
          onClose={() => {
            setShowForm(false);
            setEditingBatch(null);
          }}
          initialData={editingBatch}
          title={editingBatch ? "Edit Batch" : "Create New Batch"}
          selectedProgram={selectedProgram}
        />
      )}
    </div>
  );
};

export default BatchesList;