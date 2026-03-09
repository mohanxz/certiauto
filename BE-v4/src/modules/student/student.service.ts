import Student from "./student.model";
import Batch from "../batch/batch.model";
import { IStudent } from "./student.types";
import mongoose from 'mongoose';

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
  const filter: any = {};

  // Search filter
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phoneNumber: { $regex: query.search, $options: "i" } },
      { uniqueId: { $regex: query.search, $options: "i" } },
    ];
  }

  // Batch filter
  if (query.batchId) {
    filter.batchId = query.batchId;
  }

  // COURSE FILTER FIX - This is the key part!
  // Since enrolledCourseIds is an array, we need to use $in operator
  if (query.courseId) {
    // Handle both string and array cases
    const courseIds = Array.isArray(query.courseId) 
      ? query.courseId 
      : [query.courseId];
    
    // Convert to ObjectId if they are valid MongoDB IDs
    const objectIds = courseIds.map((id: string) => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
      }
      return id;
    });
    
    // Use $in to check if any of the student's course IDs match
    filter.enrolledCourseIds = { $in: objectIds };
  }

  console.log("MongoDB Query Filter:", JSON.stringify(filter, null, 2));

  const students = await Student.find(filter)
    .populate("enrolledCourseIds", "courseName courseCode")
    .populate("batchId", "batchName batchCode")
    .sort({ createdAt: -1 });

  return students;
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

/**
 * =====================================================
 * DELETE FILTERED STUDENTS
 * =====================================================
 */
export const deleteFilteredStudents = async (filter: any) => {
  const mongoFilter: any = { ...filter };
  
  // Handle course filter if present (same logic as getAllStudents)
  if (filter.courseId) {
    const courseIds = Array.isArray(filter.courseId) 
      ? filter.courseId 
      : [filter.courseId];
    
    const objectIds = courseIds.map((id: string) => 
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
    );
    
    mongoFilter.enrolledCourseIds = { $in: objectIds };
    delete mongoFilter.courseId; // Remove the original field
  }
  
  // Handle search filter
  if (filter.search) {
    mongoFilter.$or = [
      { name: { $regex: filter.search, $options: "i" } },
      { email: { $regex: filter.search, $options: "i" } },
      { phoneNumber: { $regex: filter.search, $options: "i" } },
      { uniqueId: { $regex: filter.search, $options: "i" } },
    ];
    delete mongoFilter.search;
  }
  
  console.log("Deleting students with filter:", mongoFilter);
  const result = await Student.deleteMany(mongoFilter);
  return result;
};