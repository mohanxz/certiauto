// utils/emailStatusUtils.js
/**
 * Extract email status for all students from campaign data
 * @param {Array} campaigns - Array of campaign objects from bulk email logs
 * @returns {Object} - Map of studentId -> email status
 */
export const extractEmailStatusFromCampaigns = (campaigns) => {
  const studentEmailMap = {};

  campaigns.forEach(campaign => {
    // Check if campaign has recipients array
    if (campaign.recipients && Array.isArray(campaign.recipients)) {
      campaign.recipients.forEach(recipient => {
        const studentId = recipient.studentId?._id || recipient.studentId;
        
        if (!studentId) return;

        // Initialize student record if not exists
        if (!studentEmailMap[studentId]) {
          studentEmailMap[studentId] = {
            totalEmails: 0,
            successful: 0,
            failed: 0,
            pending: 0,
            lastEmailDate: null,
            lastEmailStatus: null,
            lastEmailSubject: null,
            lastFailureReason: null,
            campaignHistory: []
          };
        }

        const studentRecord = studentEmailMap[studentId];
        studentRecord.totalEmails++;

        // Count by status
        const status = recipient.status?.toUpperCase();
        if (status === 'SENT' || status === 'SUCCESS') {
          studentRecord.successful++;
        } else if (status === 'FAILED') {
          studentRecord.failed++;
          // Store failure reason if available
          if (recipient.error || recipient.failureReason) {
            studentRecord.lastFailureReason = recipient.error || recipient.failureReason;
          }
        } else if (status === 'PENDING') {
          studentRecord.pending++;
        }

        // Track last email date
        const emailDate = campaign.createdAt || campaign.sentAt;
        if (emailDate && (!studentRecord.lastEmailDate || new Date(emailDate) > new Date(studentRecord.lastEmailDate))) {
          studentRecord.lastEmailDate = emailDate;
          studentRecord.lastEmailStatus = status;
          studentRecord.lastEmailSubject = campaign.subject;
          studentRecord.lastCampaignTitle = campaign.title;
          
          // Store failure reason from last failed email
          if (status === 'FAILED' && recipient.error) {
            studentRecord.lastFailureReason = recipient.error;
          }
        }

        // Store in campaign history (keep last 3)
        studentRecord.campaignHistory.push({
          campaignId: campaign._id,
          title: campaign.title,
          date: campaign.createdAt,
          status: status,
          subject: campaign.subject,
          error: recipient.error
        });
      });
    }
  });

  // Sort campaign history by date (newest first) and keep only last 3
  Object.values(studentEmailMap).forEach(record => {
    record.campaignHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    record.campaignHistory = record.campaignHistory.slice(0, 3);
  });

  return studentEmailMap;
};

/**
 * Get failure reason for a student
 * @param {Object} student - Student object
 * @param {Object} emailStatusMap - Email status map
 * @returns {string|null} - Failure reason or null
 */
export const getStudentFailureReason = (student, emailStatusMap) => {
  const status = emailStatusMap[student._id];
  
  if (!status || status.successful > 0) return null;
  
  // Check if we have a stored failure reason from logs
  if (status.lastFailureReason) {
    return status.lastFailureReason;
  }
  
  // Auto-detect common issues
  if (!student.email || !student.email.includes('@')) {
    return 'Invalid email address';
  }
  
  if (student.finalMark && Number(student.finalMark) < 45) {
    return `Marks below 45 (${student.finalMark}%)`;
  }
  
  if (status.failed > 0) {
    return 'Email sending failed (check logs)';
  }
  
  return null;
};