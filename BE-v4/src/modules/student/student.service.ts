import Student from "./student.model";
import Batch from "../batch/batch.model";
import { IStudent } from "./student.types";

/**
 * =====================================================
 * SAFE EXCEL DATE PARSER (RETURNS YYYY-MM-DD STRING)
 * =====================================================
 */
const parseExcelDate = (rawDate: any): string | undefined => {
  if (!rawDate) return undefined;

  let parsedDate: Date | undefined;

  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    parsedDate = rawDate;
  } else if (typeof rawDate === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    parsedDate = new Date(
      excelEpoch.getTime() + rawDate * 24 * 60 * 60 * 1000
    );
  } else if (typeof rawDate === "string") {
    const cleaned = rawDate.trim().replace(/\//g, "-");
    if (!cleaned) return undefined;

    const parts = cleaned.split("-");

    if (parts.length === 3 && parts[0].length <= 2) {
      const [day, month, year] = parts;
      parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      parsedDate = new Date(cleaned);
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) return undefined;

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * =====================================================
 * CREATE STUDENT
 * =====================================================
 */
export const createStudent = async (
  studentData: any,
  userId: string
) => {
  const batch = await Batch.findById(studentData.batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  const lastStudent = await Student.findOne().sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastStudent?.studentCode) {
    const parts = lastStudent.studentCode.split("-");
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      nextNumber = Number(parts[1]) + 1;
    }
  }

  const studentCode = `CYBERNAUT-${nextNumber
    .toString()
    .padStart(5, "0")}`;

  const rawDate =
    studentData.date ||
    studentData.Date ||
    studentData.completionDate;

  const completionDate = parseExcelDate(rawDate);

  const student = new Student({
    ...studentData,
    studentCode,
    createdBy: userId,
    completionDate,
  });

  return await student.save();
};

/**
 * =====================================================
 * GET ALL STUDENTS
 * =====================================================
 */
export const getAllStudents = async (query: any) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phoneNumber: { $regex: query.search, $options: "i" } },
      { uniqueId: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.courseId) filter.enrolledCourseIds = query.courseId;
  if (query.batchId) filter.batchId = query.batchId;

  const students = await Student.find(filter)
    .populate("enrolledCourseIds", "courseName courseCode")
    .populate("batchId", "batchName batchCode")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Student.countDocuments(filter);

  return {
    data: students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * =====================================================
 * GET STUDENT BY ID
 * =====================================================
 */
export const getStudentById = async (id: string) => {
  const student = await Student.findById(id)
    .populate("enrolledCourseIds", "courseName courseCode")
    .populate("batchId", "batchName batchCode");

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

/**
 * =====================================================
 * UPDATE STUDENT
 * =====================================================
 */
export const updateStudent = async (
  id: string,
  updateData: Partial<IStudent>
) => {
  if ((updateData as any).completionDate) {
    updateData.completionDate = parseExcelDate(
      (updateData as any).completionDate
    );
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updatedStudent) {
    throw new Error("Student not found");
  }

  return updatedStudent;
};

/**
 * =====================================================
 * DELETE STUDENT
 * =====================================================
 */
export const deleteStudent = async (id: string) => {
  const deleted = await Student.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Student not found");
  }

  return deleted;
};

export const deleteAllStudents = async () => {
  const result = await Student.deleteMany({});
  return result;
};