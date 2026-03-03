import mongoose, { Schema } from 'mongoose';
import { IBatch } from './batch.types';
import dbCollections from '../../config/db.collection';

const batchSchema = new Schema<IBatch>({
    programId: {
        type: Schema.Types.ObjectId,
        ref: dbCollections.PROGRAM_COLLECTION,
        required: true,
    },
    batchCode: {
        type: String,
        required: true,
        unique: true,
    },
    batchName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    startTime: {
        type: String, // HH:mm
        required: false,
    },
    endTime: {
        type: String, // HH:mm
        required: false,
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
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collation: { locale: 'en', strength: 2 }
});

// Compound unique index: batchName must be unique within a program
batchSchema.index({ programId: 1, batchName: 1 }, { unique: true });

const Batch = mongoose.model<IBatch>(dbCollections.BATCH_COLLECTION, batchSchema);

export default Batch;
