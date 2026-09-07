import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import { MessageRole } from "@prisma/client";
import {
    ChatMessagePayload,
    ChatMessageRole,
    toChatMessageRole
} from "../services/ai.service";
import { createChatStream, IntetnService } from "../ai/intent/intent.service";


const IntetnServices = new IntetnService()

export async function handleStreamChat(req: Request, res: Response) {
    try {
        const { message } = req.body;
        const applicationId = req.applicationId;

        if (!applicationId || !message) {
            throw new AppError(
                "Valid numeric userId and message are required",
                StatusCodes.BAD_REQUEST
            );
        }

        // 1. Optionally check intent first

        //cheap llm to get only the intent

        
        const intent = await IntetnServices.classify(message);
        console.log(" this is somehtin gi need to know about it Detected Intent 😎", intent);
        // so here i am gettig the intent
        
        //  created the res headers 

        // 2. Setup SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();

        // 3. Handle Client Disconnect
        let isClientConnected = true;
        req.on("close", () => {
            isClientConnected = false;
        });

        // 4. Create the LLM stream
        const payload: ChatMessagePayload[] = [
            { role: ChatMessageRole.user, content: message }
        ];

        const stream = await createChatStream(payload);
        
        let fullAiResponse = "";

        // 5. Consume stream chunks from Groq API
        for await (const chunk of stream) {
            if (!isClientConnected) break;

            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullAiResponse += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        // 6. Signal completion
        if (isClientConnected) {
            res.write(`data: ${JSON.stringify({ done: true, intent })}\n\n`);
            res.end();
        }

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: "Failed to generate AI response"
            });
        } else {
            res.end();
        }
    }
}