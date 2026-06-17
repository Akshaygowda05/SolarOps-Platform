import AppError from '../utils/AppError';
import  { StatusCodes } from 'http-status-codes';
import { Request, Response,NextFunction } from 'express';
import { getApplicationService } from '../services/application.service';


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


export default {
    getApplicationController
}

