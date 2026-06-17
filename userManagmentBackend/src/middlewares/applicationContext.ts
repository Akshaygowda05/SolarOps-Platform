import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";

export function ApplicationContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.role === Role.USER) {
      req.applicationId = req.TokenapplicationId;
      return next();
    }

    if (req.role === Role.ADMIN) {
      const applicationId = req.get("X-Application-Id");

      if (!applicationId) {
        return next(
          new AppError(
            "Application ID is required in header for admin users",
            StatusCodes.BAD_REQUEST
          )
        );
      }

      req.applicationId = applicationId;
      return next();
    }

    return next(
      new AppError("Unauthorized role", StatusCodes.FORBIDDEN)
    );
  } catch (error) {
    next(error);
  }
}