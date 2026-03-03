import { Document, Types } from 'mongoose';

export enum BulkUploadStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PARTIAL_SUCCESS = 'PARTIAL_SUCCESS'
}

export interface IBulkUpload extends Document {
    fileName: string;
    filePath: string; // Path to the uploaded Excel file
    status: BulkUploadStatus;
    totalRecords: number;
    processedRecords: number;
    successCount: number;
    failureCount: number;
    logs: string[]; // Error logs or success messages
    targetBatchId?: Types.ObjectId;
    targetCourseIds?: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
