import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user.service";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import loggers from "../config/logger";


export class UserController {
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body;
            console.log('Received user data for creation:', userData); // Debug log
            if (!userData) {

                throw new AppError('Request body is required', StatusCodes.BAD_REQUEST);
                
            }

            if(userData.role === 'USER' && (!userData.applicationId || !userData.siteName) ){
                throw new AppError('Application ID and Site Name are required for USER role', StatusCodes.BAD_REQUEST);
            }
            const user = await userService.CreateUser(userData);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            await userService.deletUser(userId);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }
    }
    static async deleteUserProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            await userService.deleteUserProfile(userId);
            res.status(200).json({ message: 'User profile deleted successfully' });
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            const updateData = req.body;
            const updatedUser = await userService.updateUser(userId, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }

    }

    static async userlogin(req: Request, res: Response,next: NextFunction) {
        try {
            const { email, password } = req.body;
            const loginResult = await userService.userLogin(email, password);
            if (loginResult) {
                res.status(200).json(loginResult);
            } else {
                throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
            }
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }

    }

    static async updateUserPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            loggers.info(`Received request to update password for user ID: ${userId}`);
            if (!req.body || !req.body.newPassword) {
                loggers.warn(`No new password provided for user ID: ${userId}`);
                throw new AppError('New password is required', StatusCodes.BAD_REQUEST);
            }
            const { newPassword } = req.body;
            loggers.info(`Updating password for user ID: ${userId}`);
            loggers.info(`New password received: ${newPassword ? 'Yes' : 'No'}`);
            await userService.updateuserPassword(userId, newPassword);
            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
      next(error);
        }

    }

    static async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await userService.getAllUsers(page, limit);

            res.json(result);
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }
    }

    static async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            const user = await userService.getUserById(userId);
            if (!user) {
                throw new AppError('User not found', StatusCodes.NOT_FOUND);
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;