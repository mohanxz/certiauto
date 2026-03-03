import EmailConfig, { IEmailConfig } from "./email.model";

// ---------------- CREATE ----------------
export const createEmail = async (data: Partial<IEmailConfig>) => {
    const exists = await EmailConfig.findOne({ email: data.email });
    if (exists) {
        throw new Error('Email already exists');
    }

    return await EmailConfig.create(data);
};

// ---------------- GET ALL ----------------
export const getAllEmails = async (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.search) {
        filter.$or = [
            { email: { $regex: query.search, $options: 'i' } },
            { provider: { $regex: query.search, $options: 'i' } }
        ];
    }

    if (query.isActive !== undefined && query.isActive !== 'all') {
        filter.isActive = query.isActive === 'true';
    }

    const emails = await EmailConfig.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await EmailConfig.countDocuments(filter);

    return {
        data: emails,
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

// ---------------- GET BY ID ----------------
export const getEmailById = async (id: string) => {
    return await EmailConfig.findById(id);
};

// ---------------- UPDATE (NOT ACTIVATION) ----------------
export const updateEmail = async (
    id: string,
    data: Partial<IEmailConfig>
) => {

    // Prevent manual activation through normal update
    if (data.isActive !== undefined) {
        delete data.isActive;
    }

    const email = await EmailConfig.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );

    if (!email) {
        throw new Error('Email config not found');
    }

    return email;
};

// ---------------- DELETE ----------------
export const deleteEmail = async (id: string) => {
    const email = await EmailConfig.findByIdAndDelete(id);

    if (!email) {
        throw new Error('Email config not found');
    }

    return email;
};

// ---------------- ACTIVATE EMAIL (ONLY ONE ACTIVE) ----------------
export const activateEmail = async (id: string) => {

    const emailExists = await EmailConfig.findById(id);
    if (!emailExists) {
        throw new Error('Email config not found');
    }

    // Deactivate all others
    await EmailConfig.updateMany(
        { _id: { $ne: id } },
        { isActive: false }
    );

    // Activate selected
    const activated = await EmailConfig.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
    );

    return activated;
};