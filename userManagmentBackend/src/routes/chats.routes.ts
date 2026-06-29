import express from "express"
import { ChatController } from "../controllers/chat.controller";
import authenticate from "../middlewares/auth.middlware";
import { ApplicationContext } from "../middlewares/applicationContext";

const chatRouter = express.Router();

chatRouter.post("/chat",authenticate,ApplicationContext,ChatController.chat)

export default chatRouter;