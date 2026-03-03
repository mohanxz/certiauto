import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, success: boolean, data: any, message?: string, pagination?: any) => {
    const responseObj: any = {
        StatusCode: statusCode,
        success,
        data,
    };
    if (message) {
        responseObj.message = message;
    }
    if (pagination) {
        responseObj.pagination = pagination;
    }
    return res.status(statusCode).json(responseObj);
};
