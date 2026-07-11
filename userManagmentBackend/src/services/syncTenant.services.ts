import { getApplicationService } from "./application.service";
import { getApplicationId } from "./syncApplications.services";
import { listTenants } from "./tenantGrc.service";

export async function syncAllTenant() {

    const tenants = await listTenants();

    for (const tenant of tenants.resultList){
        console.log(tenant.id)
       await getApplicationId(tenant.id)
    }
    
}