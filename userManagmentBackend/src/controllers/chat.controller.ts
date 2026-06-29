// controllers/chat.controller.ts

import { Request, Response } from "express";
import { AIService } from "../services/ai.service";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { toolExecuter } from "../services/tool-executor.service";

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

      const reply = await AIService.generate(message,application);

      console.log("iam here at controller after ai gave response",reply)

      const aiOutput = await toolExecuter(reply)
  
       

      return res.status(200).json({
        success: true,
        aiOutput
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