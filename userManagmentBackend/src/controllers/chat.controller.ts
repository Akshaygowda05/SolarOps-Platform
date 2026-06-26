
import { Request, Response } from "express";
import { AIService } from "../services/ai.service";


export class ChatController {
  static async chat(req: Request, res: Response) {
    const { message } = req.body;

    const reply = await AIService.ask(message);

    return res.json({
      success: true,
      reply,
    });
  }
}