import express, { Request, Response, NextFunction } from "express";
import http from 'http';
import { Server } from "socket.io";
import { MQTTconfig } from "./config/mqtt.Config";
import "./worker/queue.worker";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import router from "./routes";
import cors from "cors";
import loggers from "./config/logger";
import jwt from "jsonwebtoken";
import envconfig from "./config/envConfig";
import { getApplicationEvents } from "./config/redis";
import authenticate from "./middlewares/auth.middlware";
import "./worker/scheduler.worker";
import { checkDatabase } from "./config/DatabaseHealth";
import { ApplicationContext } from "./middlewares/applicationContext";
import cron from 'node-cron';
import { syncAllGateway } from "./services/syncGateway.service";
import { listTenants } from "./services/tenantGrc.service";
import { syncAllTenant } from './services/syncTenant.services';

const port = 3000;

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

console.log("Starting server...");

io.on("connection", (socket: any) => {
  try {
    let applicationId: string | null = null;
    const token = socket.handshake.auth?.token;
    const selectedAppId = socket.handshake.auth?.selectedAppId;

    if (!token) {
      loggers.warn("❌ Connection rejected: Missing token.", socket.id);
      return socket.disconnect();
    }

    const decoded = jwt.verify(
      token,
      envconfig.getTokenSecret()
    ) as { applicationId?: string; role?: string }; 

    if (decoded.applicationId) {
      applicationId = decoded.applicationId;
    } else if (selectedAppId) {
      loggers.info(`Admin authenticated. Routing to selected app: ${selectedAppId}`);
      applicationId = selectedAppId;
    }

    if (!applicationId) {
      loggers.warn("❌ Connection rejected: No target Application ID provided.", socket.id);
      return socket.disconnect();
    }

    socket.join(applicationId);
    loggers.info(`✅ Client connected: ${socket.id} joined room ${applicationId}`);

    socket.on("disconnect", () => {
      loggers.info(`❌ Client disconnected: ${socket.id}`);
    });

  } catch (err) {
    loggers.warn(`❌ Invalid socket token or verification failed for ${socket.id}`);
    socket.disconnect(); 
  }
});

const mqttInstance = new MQTTconfig();

// Reusable function to execute gateway sync for all tenants
async function runGatewaySync() {
  loggers.info('Running scheduled job to check gateway health...');
  try {
    const tenants = await listTenants();
    await Promise.all(
      tenants.resultList.map(async (tenant: any) => {
        try {
          await syncAllGateway(tenant.id);
        } catch (error) {
          console.error(
            `Error occurred while syncing tenant ${tenant.id}:`,
            error
          );
        }
      })
    );
  } catch (error) {
    loggers.error("Error occurred while syncing gateways:", error);
  }
}

async function startServer() {
  await checkDatabase();
  //activeInactiveJobs();

  app.use('/', router);

  app.get('/api/health', (req, res) => {
    res.json({
      mqtt: mqttInstance.getMqttHealth,
      status: mqttInstance.getMqttHealth ? "OK" : "DOWN"
    });
  });

  app.get(`/api/events`, authenticate, ApplicationContext, async (req: Request, res: Response) => {
    const applicationId = (req as any).applicationId;
    if (!applicationId) {
      return res.status(400).json({ error: "Application ID is required" });
    }
    const events = await getApplicationEvents(applicationId);
    res.json(events);
  });

  // 1. Run immediately upon server startup
  runGatewaySync().catch((err) => {
    loggers.error("Initial gateway sync failed:", err);
  });

  syncAllTenant().catch((err) => {
    loggers.error("Initial tenant sync failed:", err);
  });

  
  cron.schedule('*/45 * * * *', async () => {
    await runGatewaySync();
  });

  app.use(globalErrorHandler);

  server.listen(port, "0.0.0.0", () => {
    loggers.info(`Server is running on port ${port}`);
  });
}

startServer().catch((err) => {
  loggers.error("Server startup failed", err);
  process.exit(1);
});