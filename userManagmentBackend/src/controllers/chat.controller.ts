// controllers/chat.controller.ts

import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { toolExecuter } from "../services/tool-executor.service";
import { createIoTAgent } from "../ai/aegent.ai";

export class ChatController {
  static async chat(req: Request, res: Response) {
    try {

      const application = req.applicationId

      if(!application){
        throw  new AppError("please login again!",StatusCodes.BAD_REQUEST)
      }
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

    const agent =createIoTAgent(application)

      const reply = await agent.invoke({
        messages:[{
          role:"user",
          content:message
        }]
      })

      const response = reply.messages[reply.messages.length -1]
      console.log("this is i need to know where how response is it",reply)

  
       

      return res.status(200).json({
        success: true,
        response:response.content
      });

    } catch (err: any) {
      console.error(err);
  console.error("Code:", err.code);
  console.error("Message:", err.message);
  console.error("Config:", err.config);
  throw err;
    }
  }
}