import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";
import { Prisma } from "@prisma/client";

// Helper function to chunk array data
function chunkData<T>(data: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += size) {
        chunks.push(data.slice(i, i + size));
    }
    return chunks;
}

export async function syncChirpstackData() {
    try {
        const limit = 100;
        let offset = 0;
        const allTenants: any[] = [];

        while (true) {
            const response = await apiClient.get(
                `/api/tenants?limit=${limit}&offset=${offset}`
            );

            const tenants = response.data?.result || [];
            allTenants.push(...tenants);

            if (tenants.length < limit) break;
            offset += limit;
        }

        if (allTenants.length === 0) {
            console.log("No tenants found to sync.");
            return;
        }


        const tenantChunks = chunkData(allTenants, 500);

        for (const chunk of tenantChunks) {
        
            const now = new Date();

            await prisma.$executeRaw`
        INSERT INTO "ChirpstackTenant" ("chirpstackTenantId", "name", "description", "isActive", "lastSyncedAt", "updatedAt")
        VALUES ${Prisma.join(
                chunk.map(
                    (t: any) =>
                        Prisma.sql`(${t.id}, ${t.name || ""}, ${t.description || ""}, false, ${now}, ${now})`
                )
            )}
        ON CONFLICT ("chirpstackTenantId") 
        DO UPDATE SET 
          "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "lastSyncedAt" = EXCLUDED."lastSyncedAt";
      `;
        }

      //  console.log(`✅ Bulk upserted ${allTenants.length} tenants via Raw SQL`);

        // 3. Fetch mapped DB IDs for tenant association
        const dbTenants = await prisma.chirpstackTenant.findMany({
            where: {
                chirpstackTenantId: {
                    in: allTenants.map((t) => t.id),
                },
            },
            select: {
                id: true,
                chirpstackTenantId: true,
            },
        });

         console.log("i need to check what is going wrong here and why it is not working😎😎😎😎😎😎",dbTenants)

        const tenantMap = new Map<string, number>(
            dbTenants.map((t) => [t.chirpstackTenantId, t.id])
        );

        console.log("i need to check map what is there inside😎😎😎😎😎😎",tenantMap)

        // 4. Fetch and Sync Applications in Bulk per Tenant
        for (const tenant of allTenants) {
            console.log("this i need to get all the deviceId here to work on the device state and to get the application id and tenant id",tenant)
            // const dbTenantId = tenantMap.get(tenant.id);
            // if (!dbTenantId) continue;

            let appOffset = 0;
            const tenantApps: any[] = [];

            while (true) {
                const appResponse = await apiClient.get(
                    `/api/applications?tenantId=${tenant.id}&limit=${limit}&offset=${appOffset}`
                );

                console.log("this response i nened to check what is going wrong here and why it is not working😎😎😎😎😎😎",appResponse.data)

                const applications = appResponse.data?.result || [];
                tenantApps.push(...applications);

                if (applications.length < limit) break;
                appOffset += limit;
            }

            console.log(`Tenant ${tenant.name} → fetched ${tenantApps.length} apps`);

            // Bulk Upsert applications in chunks using Raw SQL (Replaces 1-by-1 Prisma upserts)
            if (tenantApps.length > 0) {
                const appChunks = chunkData(tenantApps, 500);

                for (const appChunk of appChunks) {

                    console.log("this i need to check what went wrong here and why it is not working😎",appChunk)
                    const now = new Date();

                    await prisma.$executeRaw`
            INSERT INTO "ChirpstackApplication" ("chirpstackAppId", "name", "description", "tenantId", "updatedAt")
            VALUES ${Prisma.join(
                        appChunk.map(
                            (app: any) =>
                                Prisma.sql`(${app.id}, ${app.name || ""}, ${app.description || ""}, ${tenant.id}, ${now})`
                        )
                    )}
            ON CONFLICT ("chirpstackAppId") 
            DO UPDATE SET 
              "name" = EXCLUDED."name",
              "description" = EXCLUDED."description",
              "tenantId" = EXCLUDED."tenantId",
              "updatedAt" = EXCLUDED."updatedAt";
          `;
                }
            }
        }

        console.log("✅ Sync completed successfully");
    } catch (error) {
        console.error("❌ Sync failed:", error);
        throw error;
    }
}