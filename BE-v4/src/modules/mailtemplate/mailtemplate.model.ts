import mongoose, { Schema, Document } from 'mongoose';


export interface IMailTemplate extends Document {
    name: string;
    subject: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}

const MailTemplateSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    body: { type: String, required: true }, // HTML content from Quill
}, {
    timestamps: true
});

export default mongoose.model<IMailTemplate>('MailTemplate', MailTemplateSchema);
