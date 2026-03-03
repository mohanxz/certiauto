import mongoose, { Schema } from "mongoose";
import { IStudent } from "./student.types";
import dbCollections from "../../config/db.collection";

const studentSchema = new Schema<IStudent>(
  {
    uniqueId: {
      type: String,
      required: true,
    },
    studentCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          // Must NOT start with 1-5
          return !/^[1-5]/.test(v);
        },
        message: "Phone number cannot start with digits 1-5.",
      },
    },
    address: {
      type: String,
      required: false,
    },
    finalMark: {
      type: String,
      required: false,
    },
    completionDate: {
      type: String,
      required: false,

    },
    courseCertificateId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },

    internshipCertificateId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    enrolledCourseIds: [
      {
        type: Schema.Types.ObjectId,
        ref: dbCollections.COURSE_COLLECTION,
      },
    ],
    batchId: {
      type: Schema.Types.ObjectId,
      ref: dbCollections.BATCH_COLLECTION,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: dbCollections.USER_COLLECTION,
      required: true,
    },
    // Removed isDeleted field for hard delete
  },
  {
    timestamps: true,
  },
);

// REMOVED ALL UNIQUE INDEXES - allow complete duplication
// No constraints for email, phoneNumber, or uniqueId

const Student = mongoose.model<IStudent>(
  dbCollections.STUDENT_COLLECTION,
  studentSchema,
);

export default Student;
