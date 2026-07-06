import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import AppError from "../utils/AppError";

 export  async function getScheduler(applicationId: string) {
    let result = await prisma.chirpstackApplication.findUnique({
      where: { chirpstackId: applicationId },
      include: { SchedularData:{
        select:{
          groupName:true,
          jobType:true,
          data:true,
          time:true
          
        }
      } },
    });

    if (!result) {
      throw new AppError("Application not found", StatusCodes.NOT_FOUND);
    }


     const payloadMap: Record<string, string> = {
          start: "Ag==",
          stop: "Aw==",
          dock: "BA==",
          return: "BQ==",
        };

       result.SchedularData = result.SchedularData.map((item) => ({
  ...item,
  data: payloadMap[item.data] ?? item.data,
}));


    return result.SchedularData;
  }
