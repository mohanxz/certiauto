import Course from './course.model';
import Batch from '../batch/batch.model';
import { ICourse } from './course.types';

export const createCourse = async (courseData: Partial<ICourse>, userId: string) => {
    // Validate Batch
    const batch = await Batch.findById(courseData.batchId);
    if (!batch) {
        throw new Error('Batch not found');
    }

    // Generate sequential course code (e.g., COURSE-00001)
    // Note: Course codes could be unique per batch or global. Keeping global for simplicity unless specific requirement.
    const lastCourse = await Course.findOne().sort({ createdAt: -1 });
    let nextCode = 1;

    if (lastCourse && lastCourse.courseCode) {
        const parts = lastCourse.courseCode.split('-');
        if (parts.length === 2 && !isNaN(Number(parts[1]))) {
            nextCode = Number(parts[1]) + 1;
        }
    }

    const courseCode = `COURSE-${nextCode.toString().padStart(5, '0')}`;

    const course = new Course({
        ...courseData,
        courseCode,
        createdBy: userId,
    });

    return await course.save();
};

export const getAllCourses = async (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };
    if (query.search) {
        filter.courseName = { $regex: query.search, $options: 'i' };
    }

    if (query.batchId) {
        filter.batchId = query.batchId;
    }

    const sort: any = {};
    if (query.sort) {
        const parts = (query.sort as string).split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1; // Default sort
    }

    const courses = await Course.find(filter)
        .populate('batchId', 'batchName batchCode')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Course.countDocuments(filter);

    return {
        data: courses,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrevious: page > 1,
        },
    };
};

export const getCourseById = async (id: string) => {
    return await Course.findById(id).populate('batchId', 'batchName batchCode');
};

export const updateCourse = async (id: string, updateData: Partial<ICourse>) => {
    return await Course.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteCourse = async (id: string) => {
    return await Course.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
