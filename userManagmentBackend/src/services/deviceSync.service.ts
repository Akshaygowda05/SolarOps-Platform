import { getApplicationByGrpc } from "./getApplicatonGrpc.services";
import { getDevicesGrpc } from "./getDevicesGrpc.service";
import { listTenants } from "./tenantGrc.service";

export async function  deviceSync(){
    const tenants = await listTenants();

for (const tenant of tenants.resultList) {

    const applications = await getApplicationByGrpc(tenant.id);

    for (const app of applications.resultList) {

        const devices = await getDevicesGrpc(
            app.id,
            "100",
            "0"
        );

        for (const device of devices.resultList) {

            console.log(device.name);

        }
    }
}
}