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
    if (!tenantId && !applicationId) {
        return next();
    }
    if (applicationId && !tenantId) {
        throw new AppError(
            "Tenant ID is required when selecting an application",
            StatusCodes.BAD_REQUEST
        );
    }
    if (tenantId && !applicationId) {
        req.tenantId = tenantId;

        return next();
    }
// again ineed to confirm that application belongs to the tenant before setting the applicationId in the request object 
    if (tenantId && applicationId) {

        const application =
            await prisma.chirpstackApplication.findFirst({
                where: {
                    chirpstackAppId: applicationId,
                    tenant: {
                        chirpstackTenantId: tenantId,
                    },
                },
                select: {
                    chirpstackAppId: true,
                },
            });

        if (!application) {
            throw new AppError(
                "Application does not belong to this tenant",
                StatusCodes.FORBIDDEN
            );
        }

        req.tenantId = tenantId;
        req.applicationId = application.chirpstackAppId;

        return next();
    }
}


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
      chirpstackAppId: applicationId,
      tenantId: tenantId,
    },
    select: {
      chirpstackAppId: true,
    },
  });

  if (!application) {
    throw new AppError(
      "Invalid application",
      StatusCodes.FORBIDDEN
    );
  }

  req.applicationId = application.chirpstackAppId;

  return next();
}


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