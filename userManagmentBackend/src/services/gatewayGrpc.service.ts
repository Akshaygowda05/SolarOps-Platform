import * as gateway_pb from "@chirpstack/chirpstack-api/api/gateway_pb";
import { gatewayClient } from "../grpc/chirpstack.client";
import { getGrpcMetadata } from "../grpc/metadata";

export async function getGatewayGrpcServices(tenantId: string) {

    const request = new gateway_pb.ListGatewaysRequest();

    request.setTenantId(tenantId);
    request.setLimit(100);

    return new Promise<gateway_pb.ListGatewaysResponse.AsObject>((resolve,reject) =>{
gatewayClient.list(request,getGrpcMetadata(),(error,response) =>{
    if(error){
        return reject(error)
    }

   if (!response) {
    return reject(new Error("No response received"));
}

    resolve(response?.toObject())
})
    })

}