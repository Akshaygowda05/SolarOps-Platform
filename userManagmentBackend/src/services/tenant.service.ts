import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";

class TenantServices {
    
  async getTenants() {

   try{
    const tenant = await prisma.chirpstackTenant.findMany({
      include:{
     _count:{
      select:{ 
      applications:true
      }
     }
      }
    });
    const lenght =  tenant.length
    
    return {
      success:true,
      totalTenant:lenght,
      data:tenant
    }


   }catch (error) {
      throw new AppError(
        "Failed to get tenants",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new TenantServices();