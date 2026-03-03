import { Document, Types } from 'mongoose';

export interface IBatch extends Document {
    programId: Types.ObjectId;
    batchCode: string; // Auto-generated: COURSECODE-BATCH-0001
    batchName: string;
    description: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
