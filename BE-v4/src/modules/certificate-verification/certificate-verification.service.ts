import Student from "../student/student.model";

export const verifyCertificate = async (certificateId: string) => {

  const student = await Student.findOne({
    $or: [
      { courseCertificateId: certificateId },
      { internshipCertificateId: certificateId }
    ]
  })
  .populate("enrolledCourseIds")
  .populate("batchId") as any;

  if (!student) {
    return {
      valid: false,
      message: "Certificate not found"
    };
  }

  let certificateType: string;

  if (student.courseCertificateId === certificateId) {
    certificateType = "COURSE_CERTIFICATE";
  } else if (student.internshipCertificateId === certificateId) {
    certificateType = "INTERNSHIP_CERTIFICATE";
  } else {
    certificateType = "UNKNOWN";
  }

  return {
    valid: true,
    certificateId,
    certificateType,
    studentName: student.name,
    email: student.email,
    courseName:
      (student.enrolledCourseIds as any[])[0]?.courseName || "",
    batchName: (student.batchId as any)?.batchName || "",
    completionDate: student.completionDate
      ? new Date(student.completionDate).toLocaleDateString("en-GB", {
          timeZone: "UTC"
        })
      : null
  };
};