import { getApplicationService } from "./application.service";
import { getApplicationId } from "./syncApplications.services";
import { syncAllGateway } from "./syncGateway.service";
import { listTenants } from "./tenantGrc.service";

export async function syncAllTenant() {

    const tenants = await listTenants();

    await Promise.all(
        tenants.resultList.map(async (tenant) => {
            try {
                await getApplicationId(tenant.id);
             
            } catch(error) {
                console.error(
                    `Error occurred while syncing tenant ${tenant.id}:`,
                    error
                );
            }
        })
    );
}

