import express,{Request,Response,NextFunction} from "express";
 
import http from 'http';
import { Server } from "socket.io";
import { MQTTconfig } from "./config/mqtt.Config";
import  "./worker/queue.worker";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import router from "./routes";
import cors from "cors";
import { activeInactiveJobs } from "./backgroungJobs/ActiveInactive";
import loggers from "./config/logger";
import  jwt  from "jsonwebtoken";
import envconfig from "./config/envConfig";
import { getApplicationEvents } from "./config/redis";
import authenticate from "./middlewares/auth.middlware";
import { jobSchedulerService } from "./queues/scheduler.jobs";
import "./worker/scheduler.worker";
import { checkDatabase } from "./config/DatabaseHealth";
const port = 3000;

export const app = express();
export const server = http.createServer(app);
 export const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST","PUT","DELETE"]
    }
})




app.use(cors());
app.use(express.json()); // this is to parse the incoming request body as JSON
app.use(express.urlencoded({ extended: true }));

console.log("Starting server...");


io.on("connection", (socket:any) => {
  try {
    const token = socket.handshake.auth?.token;

    const decoded = jwt.verify(
      token,
      envconfig.getTokenSecret()
    ) as { applicationId: string };

    const applicationId = decoded.applicationId;

    socket.join(applicationId);

    loggers.info(
      `✅ Client connected: ${socket.id} joined ${applicationId}`
    );

    socket.on("disconnect", () => {
      loggers.info("❌ Client disconnected", socket.id);
    });

  } catch (err) {
    loggers.warn("❌ Invalid socket token", socket.id);
    socket.disconnect(); 
  }
});

const mqttInstance= new MQTTconfig();

async function startServer() {
  await checkDatabase();
  //activeInactiveJobs();

  app.use('/',router);

  app.get('/api/health', (req, res) => {
    res.json({
      mqtt: mqttInstance.getMqttHealth,
      status: mqttInstance.getMqttHealth ? "OK" : "DOWN"
    });
  });

  app.get(`/api/events`, authenticate, async (req: Request, res: Response) => {
    const applicationId = (req as any).applicationId;
    if (!applicationId) {
      return res.status(400).json({ error: "Application ID is required" });
    }
    const events = await getApplicationEvents(applicationId);
    res.json(events);
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
