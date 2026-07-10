import * as device_pb from "@chirpstack/chirpstack-api/api/device_pb"
import { getGrpcMetadata } from "../grpc/metadata";
import { deviceClient } from "../grpc/chirpstack.client";

export async function getDevicesGrpc(applicationId:string,limit:string,offset:string) {
    const request = new device_pb.ListDevicesRequest();

    request.setApplicationId(applicationId);
    request.setLimit(parseInt(limit))
    request.setOffset(parseInt(offset))


    return new  Promise<device_pb.ListDevicesResponse.AsObject>((resolve,reject) =>{
        deviceClient.list(request,getGrpcMetadata(),(error,response) =>{
          if (error) {
    return reject(error);
}

if (!response) {
    return reject(new Error("No response received"));
}

resolve(response.toObject());
        })
    })
    
}