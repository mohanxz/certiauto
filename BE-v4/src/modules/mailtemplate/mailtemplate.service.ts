import MailTemplate from './mailtemplate.model';

export const createTemplate = async (data: any) => {
    return await MailTemplate.create(data);
};

export const getAllTemplates = async () => {
    return await MailTemplate.find().sort({ createdAt: -1 });
};

export const getTemplateById = async (id: string) => {
    return await MailTemplate.findById(id);
};

export const updateTemplate = async (id: string, data: any) => {
    return await MailTemplate.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTemplate = async (id: string) => {
    return await MailTemplate.findByIdAndDelete(id);
};
