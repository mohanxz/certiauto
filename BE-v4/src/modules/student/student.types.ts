import { Document, Types } from 'mongoose';

export interface IStudent extends Document {
    studentCode: string; // Auto-generated: CUBERNAUT-00001
    uniqueId: string; // User provided ID (e.g., S001)
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    finalMark?: string;
    completionDate?: string;
    enrolledCourseIds: Types.ObjectId[];
    batchId: Types.ObjectId;
    isActive: boolean;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    courseCertificateId?: string;
    internshipCertificateId?: string;
}
