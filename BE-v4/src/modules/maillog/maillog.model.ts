import mongoose, { Schema, Document } from "mongoose";
import dbCollections from "../../config/db.collection";

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  type: "CERTIFICATE" | "EMAIL";
  status: "SUCCESS" | "FAILED";
  errorMessage?: string;
  studentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema: Schema = new Schema(
  {
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, enum: ["CERTIFICATE", "EMAIL"], required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
    errorMessage: { type: String },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: dbCollections.STUDENT_COLLECTION,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IEmailLog>(
  dbCollections.MAIL_LOGS,
  EmailLogSchema,
);
