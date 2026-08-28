import Router from "express"
import { handleStreamChat } from "../controllers/chat.controller"

const chatRouter = Router()

chatRouter.post("/chat/stream",handleStreamChat)

export default chatRouter