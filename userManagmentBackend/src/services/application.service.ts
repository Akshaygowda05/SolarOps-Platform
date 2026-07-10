import AppError from "../utils/AppError";
import apiClient from "../config/apiclient";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import { Status } from "@prisma/client";

export async function getApplicationService(tenantID: string) {
  try {
    const tenant = await prisma.chirpstackTenant.findUnique({
      where: {
        chirpstackId: tenantID,
      },
      include: {
        applications: true,
      },
    });

    if (!tenant) {
      throw new AppError(
        "Tenant not found",
        StatusCodes.NOT_FOUND
      );
    }

    return {
      success: true,
      data: tenant.applications,
    };

  } catch (error) {
    throw new AppError(
      "Error while fetching application data",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}


export async function editApplicationStatus(
  applicationId: string,
  status: Status
) {
  try {
    const updatedApplication =
      await prisma.chirpstackApplication.update({
        where: {
          chirpstackId: applicationId,
        },
        data: {
          status,
        },
      });

    return {
      success: true,
      message: "Updated successfully",
      data: updatedApplication,
    };

  } catch (error) {
    throw new AppError(
      "Failed to update application status",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}