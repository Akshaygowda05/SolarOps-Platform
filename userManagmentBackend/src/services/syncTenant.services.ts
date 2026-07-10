import { listTenants } from "./tenantGrc.service";

export async function syncAllTenant() {

    const tenants = await listTenants();

    for (const tenant of tenants.resultList){
        console.log(tenant)
    }
    
}