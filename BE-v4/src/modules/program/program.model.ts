import mongoose, { Schema } from 'mongoose';
import { IProgram } from './program.types';
import dbCollections from '../../config/db.collection';

const programSchema = new Schema<IProgram>({
    programName: {
        type: String,
        required: true,
        unique: true, 
    },
    description: {
        type: String,
        required: false,
    },
    year: {
        type: Number,
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

// Index programName unique
// programSchema.index({ programName: 1 }, { unique: true }); // Handled by unique: true above? 
// Mongoose might need explicit index if unique: true uses index build.
// safely explicitly define it if we want to be sure, or just rely on unique: true.
// The previous compound index was: programSchema.index({ programName: 1, year: 1 }, { unique: true });
// We will rely on simple unique: true on the field.

const Program = mongoose.model<IProgram>(dbCollections.PROGRAM_COLLECTION, programSchema);

export default Program;
