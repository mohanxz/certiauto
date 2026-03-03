import mongoose, { Schema } from 'mongoose';
import { IBulkUpload, BulkUploadStatus } from './bulk-upload.types';
import dbCollections from '../../../config/db.collection';

const bulkUploadSchema = new Schema<IBulkUpload>({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(BulkUploadStatus),
        default: BulkUploadStatus.PENDING,
    },
    totalRecords: { type: Number, default: 0 },
    processedRecords: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    logs: [{ type: String }],
    targetBatchId: {
        type: Schema.Types.ObjectId,
        ref: dbCollections.BATCH_COLLECTION,
        required: false
    },
    targetCourseIds: [{
        type: Schema.Types.ObjectId,
        ref: dbCollections.COURSE_COLLECTION,
        required: false
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: dbCollections.USER_COLLECTION,
        required: true,
    },
}, {
    timestamps: true,
});

const BulkUpload = mongoose.model<IBulkUpload>('BulkUpload', bulkUploadSchema, dbCollections.BULK_UPLOAD_COLLECTION);
export { BulkUploadStatus };
export default BulkUpload;
