import EmailLog from './maillog.model';

export const getEmailLogs = async (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { startDate, endDate, status, type } = query;

    const filter: any = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) {
            const end = new Date(endDate as string);
            end.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    const logs = await EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'name studentCode');

    const total = await EmailLog.countDocuments(filter);

    return {
        data: logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrevious: page > 1,
        }
    };
};

export const createLog = async (data: any) => {
    return await EmailLog.create(data);
};
