import mongoose, { Schema, Types } from 'mongoose';
import { ICourse } from './course.types';
import dbCollections from '../../config/db.collection';

const courseSchema = new mongoose.Schema<ICourse>({
    batchId: {
        type: Schema.Types.ObjectId,
        ref: dbCollections.BATCH_COLLECTION,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
    },
    description: {
        type: String,
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
    collation: { locale: 'en', strength: 2 }, // Case-insensitive comparison
});

// Compound unique index: courseName must be unique within a batch
courseSchema.index({ batchId: 1, courseName: 1 }, { unique: true });

const Course = mongoose.model<ICourse>(dbCollections.COURSE_COLLECTION, courseSchema);

export default Course;
