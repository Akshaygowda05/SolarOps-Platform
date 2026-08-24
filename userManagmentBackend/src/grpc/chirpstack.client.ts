import * as grpc from "@grpc/grpc-js";

import { DeviceServiceClient } from "@chirpstack/chirpstack-api/api/device_grpc_pb";
import { ApplicationServiceClient } from "@chirpstack/chirpstack-api/api/application_grpc_pb";
import { TenantServiceClient } from "@chirpstack/chirpstack-api/api/tenant_grpc_pb";
import { GatewayServiceClient } from "@chirpstack/chirpstack-api/api/gateway_grpc_pb";

import envconfig from "../config/envConfig";

const CHIRPSTACK_GRPC_URL = envconfig.getChirpstackGrpcUrl();
const credentials = grpc.credentials.createInsecure();

function createClient<T>(
  Client: new (
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  ) => T
): T {
  return new Client(CHIRPSTACK_GRPC_URL, credentials);
}

export const deviceClient = createClient(DeviceServiceClient);
export const applicationClient = createClient(ApplicationServiceClient);
export const tenantClient = createClient(TenantServiceClient);
export const gatewayClient = createClient(GatewayServiceClient);