
import { prisma } from "../config/primsaConfig";
import { getRedisClient } from "../config/redis";

let redis = getRedisClient();


interface SiteConfigData {
    panelsGap?: string | number;
    panelWidth?: string | number;
    multiplicationFactor?: string | number;
    triggeringAction?: string;
    sendTwiceAday?: boolean;
    gatewayId?: string | string[];
    latitude?: string | number;
    longitude?: string | number;
}

class siteConfiguration {

    async getSiteConfig(applicationId: string) {
        const config = await prisma.siteConfiguration.findFirst({
            where: { applicationId },
            select:{
                panelsGap: true,
                panelWidth: true,
                multiplicationFactor:true,
                triggeringAction: true,
                sendTwiceAday: true,
                isConfigured: true,
                gatewayId: true,
                latitude: true,
                longitude: true

            }
        })
        return config;
    }


    async updateSiteConfig(applicationId: string, configData: any) {

   
    const data: any = {};

    if (configData.panelsGap !== undefined)
        data.panelsGap = parseFloat(configData.panelsGap);

    if (configData.panelWidth !== undefined)
        data.panelWidth = parseFloat(configData.panelWidth);

    if (configData.multiplicationFactor !== undefined)
        data.multiplicationFactor = parseInt(configData.multiplicationFactor);

    if (configData.triggeringAction !== undefined)
        data.triggeringAction = configData.triggeringAction;

    if (configData.sendTwiceAday !== undefined)
        data.sendTwiceAday = configData.sendTwiceAday;

    if (configData.gatewayId !== undefined)
        data.gatewayId = Array.isArray(configData.gatewayId) ? configData.gatewayId : [configData.gatewayId]; // this should be an array of strings
    if (configData.latitude !== undefined)
        data.latitude = parseFloat(configData.latitude);

    if (configData.longitude !== undefined)
        data.longitude = parseFloat(configData.longitude);

    data.isConfigured = true;

    const updatedConfig = await prisma.siteConfiguration.upsert({
        where: { applicationId },
        update: data,
        create: {
            applicationId,
            ...data
        }
    });


    await redis.del(`siteConfig:${applicationId}`);

    return updatedConfig;
}




async getStatus(applicationId: string) {
    const config = await prisma.siteConfiguration.findFirst({
        where: { applicationId },
    })

    if (!config) {
        return { 

            exits:false,
         status: "not configured"
        };
    }

    return{
        exits:true,
        status: config.isConfigured ? "configured" : "not configured"
    }
}

}


export const  siteConfigService = new siteConfiguration();