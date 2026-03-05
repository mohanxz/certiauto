// src/modules/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Card, { CardBody } from '../../components/ui/Card';
import { programAPI } from '../../api/programs';
import { batchAPI } from '../../api/batches';
import { courseAPI } from '../../api/courses';
import { studentAPI } from '../../api/students';
import { mailLogsAPI } from '../../api/mailLog';
import bulkUploadAPI from '../../api/bulkUpload';
import { format, subDays } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    activeBatches: 0,
    totalStudents: 0,
    certificatesGenerated: 0,
    totalPrograms: 0,
    totalEmails: 0,
    successfulEmails: 0,
    failedEmails: 0,
    emailSuccessRate: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [enrollmentTrend, setEnrollmentTrend] = useState([]);

  // Fetch real-time data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        programsRes, 
        batchesRes, 
        coursesRes, 
        studentsRes,
        uploadsRes,
        emailCampaignsRes,
      ] = await Promise.allSettled([
        programAPI.getAllPrograms(),
        batchAPI.getAllBatches({ page: 1, limit: 100 }),
        courseAPI.getAllCourses({ page: 1, limit: 1000 }),
        studentAPI.getAllStudents({ page: 1, limit: 1000 }),
        bulkUploadAPI.getUploadHistory(),
        fetchEmailCampaigns(),
      ]);

      // Extract data from responses
      const programs = programsRes.status === 'fulfilled' ? programsRes.value.data || [] : [];
      const batches = batchesRes.status === 'fulfilled' ? 
        batchesRes.value.data?.batches || batchesRes.value.data || [] : [];
      const courses = coursesRes.status === 'fulfilled' ? 
        coursesRes.value.data?.courses || coursesRes.value.data || [] : [];
      const students = studentsRes.status === 'fulfilled' ? 
        studentsRes.value.data?.students || studentsRes.value.data || [] : [];
      const uploads = uploadsRes.status === 'fulfilled' ? uploadsRes.value.data || [] : [];
      const emailCampaigns = emailCampaignsRes.status === 'fulfilled' ? emailCampaignsRes.value : [];

      // Calculate course statistics
      const totalCourses = courses.length;
      const activeCourses = courses.filter(course => course.isActive).length;
      const inactiveCourses = courses.filter(course => !course.isActive).length;

      // Calculate batch statistics
      const activeBatches = batches.filter(batch => {
        return batch.status !== 'completed' && batch.status !== 'archived';
      }).length;

      // Student count
      const totalStudents = students.length;
      const totalPrograms = programs.length;
      
      // Calculate email statistics from campaigns
      let totalEmails = 0;
      let successfulEmails = 0;
      let failedEmails = 0;
      let certificatesGenerated = 0;
      
      // Get data from email campaigns
      emailCampaigns.forEach(campaign => {
        if (campaign.stats) {
          totalEmails += campaign.stats.total || 0;
          successfulEmails += campaign.stats.success || 0;
          failedEmails += campaign.stats.failed || 0;
        }
        
        // Count certificates generated
        if (campaign.type === 'CERTIFICATE') {
          certificatesGenerated += campaign.stats?.success || 0;
        }
      });

      // If no campaign data, try to get mail logs
      if (totalEmails === 0) {
        try {
          const mailLogsResponse = await mailLogsAPI.getMailLogs(1, 1000);
          if (mailLogsResponse && mailLogsResponse.success) {
            const mailLogs = mailLogsResponse.data || [];
            const mailLogStats = calculateMailLogStats(mailLogs);
            totalEmails = mailLogStats.total;
            successfulEmails = mailLogStats.success;
            failedEmails = mailLogStats.failed;
            
            // Also count certificates from mail logs
            certificatesGenerated = mailLogs.filter(log => 
              log.type === 'CERTIFICATE' && 
              (log.status === 'SUCCESS' || log.status === 'SENT')
            ).length;
          }
        } catch (error) {
          console.log('Could not fetch mail logs:', error);
        }
      }

      const emailSuccessRate = totalEmails > 0 ? Math.round((successfulEmails / totalEmails) * 100) : 0;

      setStats({
        totalCourses,
        activeCourses,
        inactiveCourses,
        activeBatches,
        totalStudents,
        certificatesGenerated,
        totalPrograms,
        totalEmails,
        successfulEmails,
        failedEmails,
        emailSuccessRate
      });

      // Generate recent activities
      const activities = generateRecentActivities(emailCampaigns, uploads, students, batches);
      setRecentActivities(activities);

      // Generate enrollment trend data (7 days)
      const trendData = generateEnrollmentTrend(students);
      setEnrollmentTrend(trendData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate mail log statistics
  const calculateMailLogStats = (mailLogs) => {
    let total = 0;
    let success = 0;
    let failed = 0;
    
    mailLogs.forEach(log => {
      total++;
      const status = log.status?.toUpperCase();
      if (status === 'SUCCESS' || status === 'SENT') {
        success++;
      } else if (status === 'FAILED') {
        failed++;
      }
    });
    
    return { total, success, failed };
  };

  // Helper function to fetch email campaigns (bulk email history)
  const fetchEmailCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/bulk-email/history?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      return [];
    }
  };

  // Generate enrollment trend data for line chart (7 days)
  const generateEnrollmentTrend = (students) => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        label: format(date, 'EEE'),
        fullDate: format(date, 'MMM dd, yyyy'),
        date: format(date, 'yyyy-MM-dd'),
        day: date.getDate(),
        month: format(date, 'MMM')
      };
    });

    return last7Days.map(day => {
      const enrolledCount = students.filter(student => {
        if (!student.createdAt) return false;
        const studentDate = format(new Date(student.createdAt), 'yyyy-MM-dd');
        return studentDate === day.date;
      }).length;

      return {
        name: day.label,
        fullDate: day.fullDate,
        date: day.date,
        day: day.day,
        month: day.month,
        enrollments: enrolledCount,
        isWeekend: new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6
      };
    });
  };

  // Enhanced tooltip for line chart
  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`
          p-4 border shadow-xl rounded-lg transition-colors duration-200
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.fullDate}
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day</span>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {data.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Enrollments</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {data.enrollments}
              </span>
            </div>
            {data.isWeekend && (
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Note</span>
                <span className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded">
                  Weekend
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Generate recent activities
  const generateRecentActivities = (campaigns, uploads, students, batches) => {
    const activities = [];
    const now = new Date();
    
    // Add recent campaigns
    campaigns.slice(0, 3).forEach(campaign => {
      if (campaign.createdAt) {
        const timeDiff = Math.floor((now - new Date(campaign.createdAt)) / (1000 * 60 * 60));
        let timeText = '';
        
        if (timeDiff < 1) timeText = 'Just now';
        else if (timeDiff < 24) timeText = `${timeDiff} hours ago`;
        else if (timeDiff < 168) timeText = `${Math.floor(timeDiff / 24)} days ago`;
        else timeText = format(new Date(campaign.createdAt), 'MMM dd');
        
        const successRate = campaign.stats?.total ? 
          Math.round((campaign.stats.success / campaign.stats.total) * 100) : 0;
        
        activities.push({
          id: campaign._id,
          activity: `Email campaign: ${campaign.title} (${successRate}% success)`,
          time: timeText,
          user: 'System',
          icon: 'fas fa-envelope',
          type: 'campaign'
        });
      }
    });

    // Add recent uploads
    uploads.slice(0, 2).forEach(upload => {
      if (upload.createdAt) {
        const timeDiff = Math.floor((now - new Date(upload.createdAt)) / (1000 * 60 * 60));
        let timeText = '';
        
        if (timeDiff < 1) timeText = 'Just now';
        else if (timeDiff < 24) timeText = `${timeDiff} hours ago`;
        else timeText = format(new Date(upload.createdAt), 'MMM dd');
        
        activities.push({
          id: upload._id,
          activity: `Bulk upload completed (${upload.recordCount || 0} records)`,
          time: timeText,
          user: 'Admin',
          icon: 'fas fa-file-upload',
          type: 'upload'
        });
      }
    });

    // Add recent student enrollments
    students.slice(0, 2).forEach(student => {
      if (student.createdAt) {
        const timeDiff = Math.floor((now - new Date(student.createdAt)) / (1000 * 60 * 60));
        let timeText = '';
        
        if (timeDiff < 1) timeText = 'Just now';
        else if (timeDiff < 24) timeText = `${timeDiff} hours ago`;
        else timeText = format(new Date(student.createdAt), 'MMM dd');
        
        const batch = batches.find(b => b._id === student.batchId);
        const batchName = batch?.batchName || 'Unknown Batch';
        
        activities.push({
          id: student._id,
          activity: `New student enrolled in ${batchName}`,
          time: timeText,
          user: student.name || 'Student',
          icon: 'fas fa-user-plus',
          type: 'enrollment'
        });
      }
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dashboard
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading dashboard data...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody>
                <div className="animate-pulse">
                  <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mb-2`}></div>
                  <div className={`h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-2`}></div>
                  <div className={`h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3`}></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Programs',
      value: stats.totalPrograms.toString(),
      icon: 'fas fa-school',
      color: 'bg-indigo-500',
      change: 'Academic programs',
    },
    {
      title: 'Total Batches',
      value: stats.activeBatches.toString(),
      icon: 'fas fa-layer-group',
      color: 'bg-green-500',
      change: 'Currently running batches',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toString(),
      icon: 'fas fa-graduation-cap',
      color: 'bg-blue-500',
      change: `Active: ${stats.activeCourses} | Inactive: ${stats.inactiveCourses}`,
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: 'fas fa-users',
      color: 'bg-purple-500',
      change: `Across ${stats.totalPrograms} programs`,
    }
  ];

  const enrollmentAnalytics = enrollmentTrend.length > 0 ? {
    totalEnrollments: enrollmentTrend.reduce((sum, day) => sum + day.enrollments, 0),
    averageEnrollments: Math.round(enrollmentTrend.reduce((sum, day) => sum + day.enrollments, 0) / enrollmentTrend.length),
    peakEnrollments: Math.max(...enrollmentTrend.map(day => day.enrollments)),
    peakDay: enrollmentTrend.find(day => day.enrollments === Math.max(...enrollmentTrend.map(d => d.enrollments)))?.name || 'N/A',
    growthRate: enrollmentTrend.length > 1 ? 
      Math.round(((enrollmentTrend[enrollmentTrend.length-1].enrollments - enrollmentTrend[0].enrollments) / Math.max(1, enrollmentTrend[0].enrollments)) * 100) : 0
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Dashboard
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Real-time insights from your certificate management system
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-xl`}></i>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Enrollment Trend Chart */}
      <Card className="w-full">
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Weekly Enrollment Analytics
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Last 7 days student enrollment trend and analysis
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Daily Enrollments
                </span>
              </div>
              <button 
                onClick={fetchDashboardData}
                className={`text-sm flex items-center gap-1 transition-colors
                  ${isDarkMode 
                    ? 'text-indigo-400 hover:text-indigo-300' 
                    : 'text-blue-600 hover:text-blue-800'
                  }`}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <CardBody>
          {/* Analytics Summary */}
          {enrollmentAnalytics && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Enrollments</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {enrollmentAnalytics.totalEnrollments}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-white"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">Daily Average</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {enrollmentAnalytics.averageEnrollments}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Peak Day</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {enrollmentAnalytics.peakEnrollments}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">on {enrollmentAnalytics.peakDay}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-arrow-up text-white"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Growth Rate</p>
                    <p className={`text-2xl font-bold ${
                      enrollmentAnalytics.growthRate >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {enrollmentAnalytics.growthRate >= 0 ? '+' : ''}{enrollmentAnalytics.growthRate}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="h-96">
            {enrollmentTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={enrollmentTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="#60a5fa" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#374151' : '#e0ecff'}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDarkMode ? '#9CA3AF' : '#60a5fa', fontSize: 13, fontWeight: 500 }}
                    padding={{ left: 10, right: 10 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDarkMode ? '#9CA3AF' : '#93c5fd', fontSize: 12 }}
                    width={40}
                  />

                  <RechartsTooltip
                    content={<CustomLineTooltip />}
                    wrapperStyle={{ outline: 'none' }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {value}
                      </span>
                    )}
                  />

                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEnrollments)"
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    name="Enrollments"
                  />

                  {enrollmentAnalytics && (
                    <Line
                      type="monotone"
                      dataKey={() => enrollmentAnalytics.averageEnrollments}
                      stroke="#7dd3fc"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="7-day Average"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <i className="fas fa-chart-line text-5xl text-blue-200 dark:text-blue-800 mb-4"></i>
                <p className={`text-lg mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  No enrollment data available
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-blue-400/70' : 'text-blue-400'}`}>
                  Student enrollment data will appear here
                </p>
              </div>
            )}
          </div>

          {/* Day-by-Day Breakdown */}
          {enrollmentTrend.length > 0 && (
            <div className="mt-8">
              <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Daily Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {enrollmentTrend.map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      day.isWeekend 
                        ? isDarkMode
                          ? 'bg-yellow-900/20 border-yellow-800'
                          : 'bg-yellow-50 border-yellow-200'
                        : isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {day.name}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {day.month} {day.day}
                      </span>
                      <span className={`text-xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {day.enrollments}
                      </span>
                      <span className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        enrollments
                      </span>
                      {day.isWeekend && (
                        <span className={`text-xs mt-1 flex items-center ${
                          isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                          <i className="fas fa-star mr-1"></i>Weekend
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent Activities */}
      <Card>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Activities
          </h3>
          <button 
            onClick={fetchDashboardData}
            className={`text-sm flex items-center gap-1 transition-colors
              ${isDarkMode 
                ? 'text-indigo-400 hover:text-indigo-300' 
                : 'text-blue-600 hover:text-blue-800'
              }`}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
        <CardBody>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start p-2 rounded-lg transition-colors
                    ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: activity.type === 'campaign' ? isDarkMode ? '#1e3a8a' : '#dbeafe' :
                                        activity.type === 'upload' ? isDarkMode ? '#065f46' : '#d1fae5' :
                                        activity.type === 'enrollment' ? isDarkMode ? '#5b21b6' : '#f3e8ff' : isDarkMode ? '#92400e' : '#fef3c7'
                      }}
                    >
                      <i className={`${activity.icon} text-sm ${
                        activity.type === 'campaign' ? isDarkMode ? 'text-blue-300' : 'text-blue-600' :
                        activity.type === 'upload' ? isDarkMode ? 'text-green-300' : 'text-green-600' :
                        activity.type === 'enrollment' ? isDarkMode ? 'text-purple-300' : 'text-purple-600' : isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                      }`}></i>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {activity.activity}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <i className="fas fa-user mr-1"></i>
                        {activity.user}
                      </span>
                      <span className={`mx-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <i className="far fa-clock mr-1"></i>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <i className={`fas fa-inbox text-3xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mb-2`}></i>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No recent activities found
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Quick Actions
          </h3>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/courses"
              className={`p-4 rounded-lg text-center transition-colors block
                ${isDarkMode 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800' 
                  : 'bg-blue-50 hover:bg-blue-100'
                }`}
            >
              <i className={`fas fa-graduation-cap text-2xl mb-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}></i>
              <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Manage Courses
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View and edit all courses
              </p>
            </a>
            
            <a 
              href="/students"
              className={`p-4 rounded-lg text-center transition-colors block
                ${isDarkMode 
                  ? 'bg-green-900/20 hover:bg-green-900/30 border border-green-800' 
                  : 'bg-green-50 hover:bg-green-100'
                }`}
            >
              <i className={`fas fa-file-import text-2xl mb-2 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}></i>
              <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Import Students
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Bulk import via Excel
              </p>
            </a>
            
            <a 
              href="/batches"
              className={`p-4 rounded-lg text-center transition-colors block
                ${isDarkMode 
                  ? 'bg-purple-900/20 hover:bg-purple-900/30 border border-purple-800' 
                  : 'bg-purple-50 hover:bg-purple-100'
                }`}
            >
              <i className={`fas fa-layer-group text-2xl mb-2 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}></i>
              <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Manage Batches
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View and manage batches
              </p>
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;