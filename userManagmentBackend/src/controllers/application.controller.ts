import AppError from '../utils/AppError';
import  { StatusCodes } from 'http-status-codes';
import { Request, Response,NextFunction } from 'express';
import { editStatusOfApplicationService, getApplicationService } from '../services/application.service';
import { Status } from '@prisma/client';


async function getApplicationController(req: Request, res: Response, next: NextFunction) {
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
        next(error);
    }
    }


export async function editstatusOfApplicationController(req: Request, res: Response, next: NextFunction) {
    try{
        const applicationId = req.query.id as string;
        const status = req.query.status as Status;

        if(!applicationId || !status) {
            throw new AppError(
                "applicationId and status are required",
                StatusCodes.BAD_REQUEST
            );
        }

        const result = await editStatusOfApplicationService(applicationId, status);
        res.status(StatusCodes.OK).json(result);
    }catch (error) {
        next(error);
    }
}

export default {
    getApplicationController,
    
}

