import mongoose, { Schema, Document } from 'mongoose';
import dbCollections from '../../config/db.collection';

export interface IRecipient {
  studentId: mongoose.Types.ObjectId;
  email: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error?: string;
  sentAt?: Date;
}

export interface IBulkEmailJob extends Document {
  title: string;
  batchIds: mongoose.Types.ObjectId[];
  courseIds: mongoose.Types.ObjectId[];
  senderEmailId: mongoose.Types.ObjectId;
type: "EMAIL" | "COURSE_CERTIFICATE" | "INTERNSHIP_CERTIFICATE";
  certificateTemplateId?: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS';
  stats: {
    total: number;
    success: number;
    failure: number;
  };
  recipients: IRecipient[];
  createdBy: mongoose.Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
}

const RecipientSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: dbCollections.STUDENT_COLLECTION,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING'
  },
  error: String,
  sentAt: Date,
});

const BulkEmailJobSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    batchIds: [{
      type: Schema.Types.ObjectId,
      ref: dbCollections.BATCH_COLLECTION
    }],
    courseIds: [{
      type: Schema.Types.ObjectId,
      ref: dbCollections.COURSE_COLLECTION
    }],
    senderEmailId: {
      type: Schema.Types.ObjectId,
      ref: dbCollections.EMAIL_CONFIG_COLLECTION,
      required: true
    },
  type: {
  type: String,
  enum: [
    "EMAIL",
    "COURSE_CERTIFICATE",
    "INTERNSHIP_CERTIFICATE",
  ],
  required: true,
},
    certificateTemplateId: {
      type: Schema.Types.ObjectId,
      ref: dbCollections.CERTIFICATE_TEMPLATE_COLLECTION
    },
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL_SUCCESS'],
      default: 'PENDING',
    },
    stats: {
      total: { type: Number, default: 0 },
      success: { type: Number, default: 0 },
      failure: { type: Number, default: 0 },
    },
    recipients: [RecipientSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: dbCollections.USER_COLLECTION,
      required: true
    },
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for duration
BulkEmailJobSchema.virtual('duration').get(function () {
  if (this.startedAt && this.completedAt) {
    return this.completedAt.getTime() - this.startedAt.getTime();
  }
  return null;
});

// Indexes for performance
BulkEmailJobSchema.index({ status: 1, createdAt: 1 });
BulkEmailJobSchema.index({ createdBy: 1 });
BulkEmailJobSchema.index({ 'recipients.studentId': 1 });

// Ensure EMAIL_CONFIG_COLLECTION is available in db.collection.ts if not already
export default mongoose.model<IBulkEmailJob>(
  dbCollections.BULK_EMAIL_JOB_COLLECTION,
  BulkEmailJobSchema
);