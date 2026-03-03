import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailConfig extends Document {
    email: string;
    appPassword: string;
    provider: string;
    isActive: boolean;
    createdAt: Date;
}

const EmailConfigSchema = new Schema<IEmailConfig>({
    email: { type: String, required: true, unique: true },
    appPassword: { type: String, required: true }, // Note: In a real app, should be encrypted
    provider: { type: String, default: 'gmail' },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEmailConfig>(
    'EmailConfig',
    EmailConfigSchema
);
