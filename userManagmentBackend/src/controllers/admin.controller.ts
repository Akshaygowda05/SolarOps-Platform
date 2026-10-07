import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import AppError from "../utils/AppError";
import adminServices from "../adminservices/admin.services";
const adminService = new adminServices();

class adminController {
    // first i will write the function to get the pannel cleaned for today


    async getTodaysPannelsCleanedController(req: Request, res: Response, next: NextFunction) {

        try {

            const tenantId = req.tenantId as string;

            if (!tenantId) {
                throw new AppError(
                    "tenantId is required",
                    StatusCodes.BAD_REQUEST
                );
            }

            const result = await adminService.getTodaysPannelsCleaned(tenantId);
            res.status(StatusCodes.OK).json(result);
        }catch (error) {
            next(error);
        }
}

 async getLast5DaysPannelsCleanedController(req: Request, res: Response, next: NextFunction) {
    try {
        const tenantId = req.tenantId as string;

        if (!tenantId) {
            throw new AppError(
                "tenantId is required",
                StatusCodes.BAD_REQUEST
            );
        }

        const result = await adminService.getLast5DaysPannelsCleaned(tenantId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }

 }

 async getMontlyPannelCLeandController(req: Request, res: Response, next: NextFunction) {
    try {
        const tenantId = req.tenantId as string;
        if (!tenantId) {
            throw new AppError(
                "tenantId is required",
                StatusCodes.BAD_REQUEST
            );
        }

        const result = await adminService.getMontlyPannelCLeand(tenantId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
}

    async getYearlyPannelsCleanedController(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId as string;
            if (!tenantId) {
                throw new AppError(
                    "tenantId is required",
                    StatusCodes.BAD_REQUEST
                );
            }
    
            const result = await adminService.getYearlyPannelsCleaned(tenantId);
            res.status(StatusCodes.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }

    async getOnlineOfflineCountController(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId as string;
            if (!tenantId) {
                throw new AppError(
                    "tenantId is required",
                    StatusCodes.BAD_REQUEST
                );
            }
    
            const result = await adminService.getOnlineOfflineCount(tenantId);
            res.status(StatusCodes.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getGatewayStatsController(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.tenantId as string;
            if (!tenantId) {
                throw new AppError(
                    "tenantId is required",
                    StatusCodes.BAD_REQUEST
                );
            }
        const  result = await adminService.getGatewayStats(tenantId);
        res.status(StatusCodes.OK).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getApplicationStatsController(req: Request, res: Response, next: NextFunction) {
        try{ 

            const tenantId = req.tenantId as string;
            if (!tenantId) {
                throw new AppError(
                    "tenantId is required",
                    StatusCodes.BAD_REQUEST
                );
            }

            const result = await adminService.getApplicationStats(tenantId);
            res.status(StatusCodes.OK).json(result);
    }catch (error) {
        next(error)
    }

}

}

export const adminControllerInstance = new adminController();