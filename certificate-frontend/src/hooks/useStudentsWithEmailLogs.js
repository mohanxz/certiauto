// hooks/useStudentsWithEmailLogs.js
import { useState, useEffect } from "react";
import { studentAPI } from "../api/students";
import { bulkEmailAPI } from "../api/bulkEmail";
import { extractEmailStatusFromCampaigns } from "../utils/emailStatusUtils";

export const useStudentsWithEmailLogs = (filters) => {
  const [students, setStudents] = useState([]);
  const [emailStatusMap, setEmailStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch students and campaign logs in parallel
      const [studentsRes, campaignsRes] = await Promise.all([
        studentAPI.getAllStudents(filters),
        bulkEmailAPI.getCampaignHistory({ limit: 1000 }), // Get all campaigns
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data);
      }

      if (campaignsRes.success) {
        setCampaigns(campaignsRes.data);
        // Extract email status from campaigns
        const statusMap = extractEmailStatusFromCampaigns(campaignsRes.data);
        setEmailStatusMap(statusMap);
      }
    } catch (err) {
      console.error("Error merging data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Merge students with email status
  const mergedStudents = students.map((student) => ({
    ...student,
    emailStatus: emailStatusMap[student._id] || {
      totalEmails: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      lastEmailDate: null,
      lastEmailStatus: null,
      campaignHistory: [],
    },
  }));

  return {
    students: mergedStudents,
    campaigns,
    emailStatusMap,
    loading,
    error,
    refresh: fetchData,
  };
};
