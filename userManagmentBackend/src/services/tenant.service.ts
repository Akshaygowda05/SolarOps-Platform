import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import apiClient from "../config/apiclient";

class TenantServices {
    
  async getTenants() {
    try {
      const result = [];
      const limit = 50;
      let offset = 0;

      while (true) {
        const response = await apiClient.get("/tenants", {
          params: {
            limit,
            offset,
          },
        });

        const tenants = response?.data?.result || [];

        if (tenants.length === 0) {
          break;
        }

        result.push(...tenants);
        offset += limit;
      }

      return result;
    } catch (error) {
      throw new AppError(
        "Failed to get tenants",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new TenantServices();