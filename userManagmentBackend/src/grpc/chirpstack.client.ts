import * as grpc from "@grpc/grpc-js";

import { DeviceServiceClient } from "@chirpstack/chirpstack-api/api/device_grpc_pb";
import { ApplicationServiceClient } from "@chirpstack/chirpstack-api/api/application_grpc_pb";
import { TenantServiceClient } from "@chirpstack/chirpstack-api/api/tenant_grpc_pb";

import envconfig from "../config/envConfig";

const CHIRPSTACK_GRPC_URL = envconfig.getChirpstackGrpcUrl();

const credentials = grpc.credentials.createInsecure();

export const deviceClient = new DeviceServiceClient(
  CHIRPSTACK_GRPC_URL,
  credentials
);

export const applicationClient = new ApplicationServiceClient(
  CHIRPSTACK_GRPC_URL,
  credentials
);

export const tenantClient = new TenantServiceClient(
  CHIRPSTACK_GRPC_URL,
  credentials
);