import mongoose, { Schema, Document, Types } from 'mongoose';
import dbCollections from '../../config/db.collection';

export interface ICertificateTemplate extends Document {
    name: string;
    filePath: string;
    originalName: string;
    description: string;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CertificateTemplateSchema: Schema = new Schema({
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    description: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: dbCollections.USER_COLLECTION, required: true }
}, {
    timestamps: true
});

export default mongoose.model<ICertificateTemplate>(dbCollections.CERTIFICATE_TEMPLATE_COLLECTION, CertificateTemplateSchema);
