import * as application_pb from "@chirpstack/chirpstack-api/api/application_pb"
import { applicationClient } from "../grpc/chirpstack.client"
import { getGrpcMetadata } from "../grpc/metadata";


export async function getApplicationByGrpc(tenantId:string){
    const request =  new application_pb.ListApplicationsRequest()
    request.setTenantId(tenantId);
request.setLimit(100);
request.setOffset(0);
    
return new Promise<application_pb.ListApplicationsResponse.AsObject>(
    (resolve, reject) => {

        applicationClient.list(
            request,
            getGrpcMetadata(),
            (error, response) => {

                if (error) {
                    return reject(error);
                }

                if (!response) {
                    return reject(new Error("No response received"));
                }

                resolve(response.toObject());
            }
        );
    }
);

}