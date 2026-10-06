// this is for the teanant level accesss

import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";

interface DashboardCountsRow {
  total: bigint;
  online: bigint;
}

class adminServices {



    // first i need to write about the function to get the pannlecleand

    // first i will get todays data how much pannel cleaned by the particular tenant

    async getTodaysPannelsCleaned(tenantId: string) {
        const result = await prisma.$queryRaw`
            SELECT SUM(rb."panelsCleaned")::int AS "panelsCleaned"
            FROM "RobotData" rb
            WHERE rb."tenantId" = ${tenantId}
              AND rb."createdAt" >= CURRENT_DATE
              AND rb."createdAt" < CURRENT_DATE + INTERVAL '1 day';
        
        `
        return result;
    }


    // next  i need to get for previous 5 days
    
    async getLast5DaysPannelsCleaned(tenantId: string) {
        const result  = await prisma.$queryRaw`
            SELECT 
              DATE(rb."createdAt") AS date,
              SUM(rb."pannelcCleaned")::int AS "pannelsCleaned"
            FROM "RobotData" rb
            WHERE rb."tenantId" = ${tenantId}
              AND rb."createdAt" >= CURRENT_DATE - INTERVAL '5 days'
              AND rb."createdAt" < CURRENT_DATE
            GROUP BY DATE(rb."createdAt")
            ORDER BY DATE(rb."createdAt");
        `
        return result;
    }


    // next i need to get data for 6 months data

    async getMontlyPannelCLeand(tenantId:string){
        const result = await prisma.$queryRaw`
            SELECT
             month.month,
             COALESCE(SUM(rb."panelsCleaned"), 0)::int AS "pannelsCleaned"
            FROM generate_series(
                DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
                DATE_TRUNC('month', CURRENT_DATE),
                INTERVAL '1 month'
            ) AS month
            LEFT JOIN "RobotData" rb
                ON DATE_TRUNC('month', rb."createdAt") = month.month
            WHERE rb."tenantId" = ${tenantId}
            GROUP BY month.month
            ORDER BY month.month;
        `
        return result;
    }

    // now i  need to get for the last 3 years data for the pannels cleaned for the particular tenant

    async getYearlyPannelsCleaned(tenantId:string){
        const result = await prisma.$queryRaw`
            SELECT
                year.year,
                COALESCE(SUM(rb."panelsCleaned"), 0)::int AS "pannelsCleaned"
            FROM generate_series(
                DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '2 years',
                DATE_TRUNC('year', CURRENT_DATE),
                INTERVAL '1 year'
            ) AS year
            LEFT JOIN "RobotData" rb
                ON DATE_TRUNC('year', rb."createdAt") = year.year
            WHERE rb."tenantId" = ${tenantId}
            GROUP BY year.year
            ORDER BY year.year;
        `
        return result;
    }


    // now i need to get all the offline and online count for the particular tenant
    

    async getOnlineOfflineCount(tenantId:string){
        const result = await prisma.$queryRaw<DashboardCountsRow[]>`
            SELECT
              COUNT(*) AS "total",
              COUNT(*) FILTER (WHERE ds."isOnline" = true) AS "online"
            FROM "DeviceState" ds
            WHERE ds."tenantId" = ${tenantId};
        `

        const totalDevices = Number(result[0]?.total ?? 0);
        const onlineDevices = Number(result[0]?.online ?? 0);
        return { totalDevices, onlineDevices };
    }

    // this is to get the data for the gateways for the particular tenant

    async getGatewayStats(tenantId:string){
        const result = await apiClient.get('/api/gateways', { 
            params: { 
                tenantId,
            limit: 1000,}
        });
        return result.data;
    }

    // application stats for the particular tenant

    async getApplicationStats(tenantId:string){
        const result = await prisma.chirpstackApplication.findMany({
            where: { tenantId },
            select:{
                chirpstackAppId: true,
                name:true,
                devicesState: {
                    select:{
                        isOnline: true  // can i get tot`al count of the devices and online and offline count
                    }
                },
                robotData: {
                    select:{
                        panelsCleaned: true
                    },where:{
                        createdAt: {
                            gte: new Date(new Date().setTime(0)), 
                            lt: new Date(new Date().setTime(0) + 24 * 60 * 60 * 1000)
                        }
                    }
                }
            }
            
        })


        const applicationStats = result.map(app =>{
            return {
                applicationId: app.chirpstackAppId,
                applicationName: app.name,
                totalDevices: app.devicesState.length,
                onlineDevices: app.devicesState.filter(device => device.isOnline).length,
                offlineDevices: app.devicesState.filter(device => !device.isOnline).length,
                panelsCleanedToday: (app.robotData as Array<{ panelsCleaned: number }>).reduce(
                    (sum, data) => sum + data.panelsCleaned,
                    0
                )
            }

        })
        return applicationStats;
    }


}

export default adminServices;