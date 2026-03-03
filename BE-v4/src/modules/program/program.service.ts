import Program from './program.model';
import { IProgram } from './program.types';

export const createProgram = async (programData: Partial<IProgram>) => {
    return await Program.create(programData);
};

export const getAllPrograms = async (filter: any = {}) => {
    return await Program.find({ ...filter, isDeleted: false }).sort({ createdAt: -1 });
};

export const getProgramById = async (id: string) => {
    return await Program.findOne({ _id: id, isDeleted: false });
};

export const updateProgram = async (id: string, updateData: Partial<IProgram>) => {
    return await Program.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProgram = async (id: string) => {
    return await Program.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
