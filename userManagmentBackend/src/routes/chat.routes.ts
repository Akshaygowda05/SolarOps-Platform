import Router from "express"
import { handleStreamChat } from "../controllers/chat.controller"
import authenticate from "../middlewares/auth.middlware"
import { ApplicationContext } from "../middlewares/applicationContext"

const chatRouter = Router()

chatRouter.post("/chat/stream",authenticate,ApplicationContext,handleStreamChat)

export default chatRouter