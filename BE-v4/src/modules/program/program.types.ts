import { Document, Types } from 'mongoose';

export interface IProgram extends Document {
    programName: string;
    description?: string;
    year?: number;
    isActive: boolean;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
