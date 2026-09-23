import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";




export async function ApplicationContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    // =========================
    // SUPERADMIN
    // =========================
if (req.role === Role.SUPERADMIN) {

    const tenantId = req.get("X-Tenant-Id");
    const applicationId = req.get("X-Application-Id");

    // --------------------------------
    // Nothing selected
    // --------------------------------
    if (!tenantId && !applicationId) {
        return next();
    }

    // --------------------------------
    // Application without tenant
    // --------------------------------
    if (applicationId && !tenantId) {
        throw new AppError(
            "Tenant ID is required when selecting an application",
            StatusCodes.BAD_REQUEST
        );
    }

    // --------------------------------
    // Tenant selected
    // --------------------------------

    // so users is superadmin then anyhow if we will have 
    // every tenant then i dont check everything 
    if (tenantId && !applicationId) {
        req.tenantId = tenantId;

        return next();
    }

    // --------------------------------
    // Tenant + application selected
    // --------------------------------
    if (tenantId && applicationId) {

        const application =
            await prisma.chirpstackApplication.findFirst({
                where: {
                    chirpstackId: applicationId,
                    tenant: {
                        chirpstackId: tenantId,
                    },
                },
                select: {
                    chirpstackId: true,
                },
            });

        if (!application) {
            throw new AppError(
                "Application does not belong to this tenant",
                StatusCodes.FORBIDDEN
            );
        }

        req.tenantId = tenantId;
        req.applicationId = application.chirpstackId;

        return next();
    }
}


  // =========================
    // ADMIN
    // =========================

if (req.role === Role.ADMIN) {
  const tenantId = req.tenantId;
  const applicationId = req.get("X-Application-Id");

  if (!tenantId) {
    throw new AppError(
      "Tenant context is missing, please login again!",
      StatusCodes.FORBIDDEN
    );
  }

  if (!applicationId) {
    return next();
  }

  const application = await prisma.chirpstackApplication.findFirst({
    where: {
      chirpstackId: applicationId,
      tenantId: tenantId,
    },
    select: {
      chirpstackId: true,
    },
  });

  if (!application) {
    throw new AppError(
      "Invalid application",
      StatusCodes.FORBIDDEN
    );
  }

  req.applicationId = application.chirpstackId;

  return next();
}


    // =========================
    // USER
    // =========================
    if (req.role === Role.USER) {

      if (!req.applicationId) {
        throw new AppError(
          "Application context is missing",
          StatusCodes.FORBIDDEN
        );
      }

      return next();
    }


    throw new AppError(
      "Unauthorized role",
      StatusCodes.FORBIDDEN
    );

  } catch (error) {
    next(error);
  }
}