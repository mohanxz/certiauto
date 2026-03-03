import Batch from './batch.model';
import Program from '../program/program.model';
import { IBatch } from './batch.types';
import { Types } from 'mongoose';

export const createBatch = async (batchData: Partial<IBatch>, userId: string) => {
    // 1. Fetch Program details
    const program = await Program.findById(batchData.programId);
    if (!program) {
        throw new Error('Program not found');
    }

    // 2. Find last batch FOR THIS PROGRAM to increment ID
    const lastBatch = await Batch.findOne({ programId: batchData.programId })
        .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastBatch && lastBatch.batchCode) {
        // Expected format: <ProgramNameSlug>-<Year>-BATCH-0001
        const parts = lastBatch.batchCode.split('-BATCH-');
        if (parts.length === 2 && !isNaN(Number(parts[1]))) {
            nextNumber = Number(parts[1]) + 1;
        }
    }

    // Generate slug from Program Name (e.g., Tech Trio -> TECHTRIO)
    const programSlug = program.programName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const year = program.year || new Date().getFullYear();
    const batchCode = `${programSlug}-${year}-BATCH-${nextNumber.toString().padStart(4, '0')}`;

    const batch = new Batch({
        ...batchData,
        batchCode,
        createdBy: userId,
    });

    return await batch.save();
};

export const getAllBatches = async (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };
    if (query.search) {
        filter.batchName = { $regex: query.search, $options: 'i' };
    }
    if (query.programId) {
        filter.programId = query.programId;
    }

    const sort: any = {};
    if (query.sort) {
        const parts = (query.sort as string).split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1;
    }

    const batches = await Batch.find(filter)
        .populate('programId', 'programName year')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Batch.countDocuments(filter);

    return {
        data: batches,
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

export const getBatchById = async (id: string) => {
    return await Batch.findById(id).populate('programId', 'programName year');
};

export const updateBatch = async (id: string, updateData: Partial<IBatch>) => {
    return await Batch.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteBatch = async (id: string) => {
    return await Batch.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
