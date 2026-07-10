import {
    deviceClient
} from "../grpc/chirpstack.client";


import {
    getGrpcMetadata
} from "../grpc/metadata";


import {
    ListDevicesRequest
} from "@chirpstack/chirpstack-api/api/device_pb";



export async function testGrpc(
    applicationId:string
){

    const request =
       new ListDevicesRequest();


    request.setApplicationId(
        applicationId
    );


    request.setLimit(10);



    const response =
      await new Promise<any>(
        (resolve,reject)=>{


        deviceClient.list(
            request,
            getGrpcMetadata(),

            (error,result)=>{


                if(error){
                    reject(error);
                    return;
                }


                resolve(result);

            }
        )


      });



console.log(
 response.toObject()
);


}