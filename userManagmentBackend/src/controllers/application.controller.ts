import AppError from '../utils/AppError';
import  { StatusCodes } from 'http-status-codes';
import { Request, Response,NextFunction } from 'express';
import { editStatusOfApplicationService, getAcitveApplicationsService, getApplicationService } from '../services/application.service';
import { Status } from '@prisma/client';
import { syncAllTenant } from '../services/syncTenant.services';


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
        const applicationId = req.params.applicationId as string;
        const status = req.body.status as Status;

        if(!applicationId) {
            throw new AppError(
                "applicationId is required",
                StatusCodes.BAD_REQUEST
            );
        }

        if(!status) {
            throw new AppError(
                "status is required",
                StatusCodes.BAD_REQUEST
            );
        }

        const result = await editStatusOfApplicationService(applicationId, status);

        // write  A FUNCTION TO sync 

        await  syncAllTenant()
        res.status(StatusCodes.OK).json(result);
    }catch (error) {
        next(error);
    }
}


async function  getActiveApplicationsController(req:Request, res:Response, next:NextFunction) {
    try{
        const result = await getAcitveApplicationsService();   
        res.status(StatusCodes.OK).json(result);
    }catch (error) {
        next(error);
    }
}

export default {
    getApplicationController,
    editstatusOfApplicationController,
    getActiveApplicationsController
}

