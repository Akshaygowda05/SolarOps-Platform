import * as grpc from "@grpc/grpc-js";
import envconfig from "../config/envConfig";


export function getGrpcMetadata(){

    const metadata = new grpc.Metadata();

    metadata.set(
        "authorization",
        `Bearer ${envconfig.getChirpstackKey}`
    );

    return metadata;
}