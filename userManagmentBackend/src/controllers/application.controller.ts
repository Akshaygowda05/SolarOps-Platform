import AppError from '../utils/AppError';
import  { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { getApplicationService } from '../services/application.service';


async function getApplicationController(req: Request, res: Response) {
    try{

        const tenantID = req.query.tenantID as string;

        if(!tenantID) {
            throw new AppError(
                "tenantID is required",
                StatusCodes.BAD_REQUEST
            );
        }

        const result = await getApplicationService(tenantID);
        res.status(StatusCodes.OK).json(result);
    }catch (error) {
        throw new AppError(
            "Error while fetching application data",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

export default {
    getApplicationController
}

