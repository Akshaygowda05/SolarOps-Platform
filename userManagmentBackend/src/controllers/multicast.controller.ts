import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import { Blocktriggering } from "@prisma/client";
import MulticastService from "../services/multicast.service";
import loggers from "../config/logger";
import { storeApplicationEvents } from "../config/redis";
import apiClient from "../config/apiclient";

class multicastController {

    async sendDownlink(req: Request, res: Response) {

        // application id
        const applicationId = req.applicationId;

        if (!applicationId) {
            throw new AppError(
                "Application ID is required",
                StatusCodes.BAD_REQUEST
            );
        }

        
        const { groupId, data,groupName } = req.body;

        // validate groupId
        if (!Array.isArray(groupId) || groupId.length === 0) {
            throw new AppError(
                "groupId must be a non-empty array",
                StatusCodes.BAD_REQUEST
            );
        }

        // validate data
        if (!data) {
            throw new AppError(
                "Data is required",
                StatusCodes.BAD_REQUEST
            );
        }

        // get latest site configuration
        const siteconfiguration = await prisma.siteConfiguration.findFirst({
            where: {
                applicationId
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                triggeringAction: true,
                sendTwiceAday: true,
                isConfigured: true
            }
        });

        
        let triggeringAction:Blocktriggering  = Blocktriggering.UNICAST;

        
        if (siteconfiguration?.isConfigured) {
            triggeringAction = siteconfiguration.triggeringAction;
        }

        switch (triggeringAction) {

            case Blocktriggering.UNICAST: {

                for (const id of groupId) {

                    await MulticastService.sendUnicastDownlink(
                        id,
                        data,
                        applicationId
                    );
                   
                }

                break;

              
            }
            case Blocktriggering.MULTICAST: {

                for (const id of groupId) {

                 //   const name = await apiClient.get(`/api/multicast-groups/${id}`)).data?.multicastGroup?.name || groupId

                    await MulticastService.sendMulticastDownlink(
                        id,
                        data,
                        applicationId
                    );
                }

                break;

            }


            case Blocktriggering.BOTH: {

                for (const id of groupId) {

                    // multicast first
                    await MulticastService.sendMulticastDownlink(
                        id,
                        data,
                        applicationId
                    );

                    // delay
                    await new Promise(resolve =>
                        setTimeout(resolve, 1000)
                    );

                    // then unicast
                    await MulticastService.sendUnicastDownlink(
                        id,
                        data,
                        applicationId
                    );
                }

                 
break;
               
      
            }

            default:
                throw new AppError(
                    "Invalid triggering action",
                    StatusCodes.BAD_REQUEST
                );
        }
    

    await storeApplicationEvents(
        applicationId,
        JSON.stringify({
            type: "GROUP_DOWNLINK",
            name: groupName || groupId,
            timeStamp: new Date().toISOString()
        })
    );

      return res.status(StatusCodes.OK).json({
                    success: true,
                    triggeringAction: "UNICAST",
                    message: "Multicast  downlink sent successfully"
                });


            }

}

export  let MulticastController = new multicastController();