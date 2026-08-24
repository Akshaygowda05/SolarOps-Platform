import * as tenant_pb from "@chirpstack/chirpstack-api/api/tenant_pb";
import { tenantClient } from "../grpc/chirpstack.client";
import { getGrpcMetadata } from "../grpc/metadata";


export async function listTenants() {
    const request = new tenant_pb.ListTenantsRequest();

    request.setLimit(100);
    request.setOffset(0);
return new Promise<tenant_pb.ListTenantsResponse.AsObject>((resolve,reject) =>{
    tenantClient.list(request,getGrpcMetadata(),(error,response) =>{
        if(error || !response){
            return reject(error)
        }

        

        resolve(response?.toObject())
    })
})

}
export async function getTenant(id: string) {
    const request = new tenant_pb.GetTenantRequest();

    request.setId(id);

    return new Promise((resolve, reject) => {
        tenantClient.get(
            request,
            getGrpcMetadata(),
            (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(response?.toObject());
            }
        );
    });
}