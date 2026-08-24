import logger from "../config/logger";
import { getApplicationService } from "./application.service";
import { getApplicationId } from "./syncApplications.services";
import { syncAllGateway } from "./syncGateway.service";
import { listTenants } from "./tenantGrc.service";

export async function syncAllTenant() {

    const tenants = await listTenants();

    await Promise.all(
        tenants.resultList.map(async (tenant) => {
            try {
                logger.info(`Starting sync for tenant: ${tenant.id}`);
                await getApplicationId(tenant.id);
                logger.info(`Application ID sync completed for tenant: ${tenant.id}`);
             
            } catch(error) {
                logger.error(
                    `Error occurred while syncing tenant ${tenant.id}:`,
                    error
                );
            }
        })
    );
}

