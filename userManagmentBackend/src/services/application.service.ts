import AppError from "../utils/AppError";
import apiClient from "../config/apiclient";
import { StatusCodes } from "http-status-codes";

export async function getApplicationService(tenantID: string) {
  try {
    const result = [];
    const limit = 50;
    let offset = 0;

    while (true) {
      const response = await apiClient.get("/applications", {
        params: {
          tenantID,
          limit,
          offset,
        },
      });

      const applications = response?.data?.result || [];

      if (applications.length === 0) {
        break;
      }

      result.push(...applications);

      if (applications.length < limit) {
        break;
      }

      offset += limit;
    }

    return result;
  } catch (error) {
    throw new AppError(
      "Error while fetching application data",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}