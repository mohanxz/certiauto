import { Document, Types } from 'mongoose';

export interface ICourse extends Document {
    batchId: Types.ObjectId;
    courseName: string;
    courseCode: string; // Auto-generated
    description: string;
    isActive: boolean;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
