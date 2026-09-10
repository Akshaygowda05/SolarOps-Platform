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
import { createChatStream, streamAgentChat, IntetnService } from "../ai/intent/intent.service";


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
        const intent = await IntetnServices.classify(message);
        console.log("Detected Intent 😎:", intent);

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

        // 4. Consume agent stream (handles reasoning, tool calls, and final response)
        let fullAiResponse = "";

        for await (const content of streamAgentChat({ applicationId, message, intent })) {
            if (!isClientConnected) break;

            fullAiResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }

        // 5. Signal completion
        if (isClientConnected) {
            res.write(`data: ${JSON.stringify({ done: true, intent })}\n\n`);
            res.end();
        }

    } catch (error: any) {
        console.error("Error in handleStreamChat:", error);
        if (!res.headersSent) {
            res.status(500).json({
                message: error?.message || "Failed to generate AI response"
            });
        } else {
            res.write(`data: ${JSON.stringify({ error: error?.message || "Failed to generate AI response" })}\n\n`);
            res.end();
        }
    }
}