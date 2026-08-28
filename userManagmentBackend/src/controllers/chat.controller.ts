import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import { MessageRole } from "@prisma/client";
import {
    ChatMessagePayload,
    createChatStream,
    toChatMessageRole
} from "../services/ai.service";

export async function handleStreamChat(
    req: Request,
    res: Response
) {
    try {

        // console.log("Chat request received");

        const { userId, message } = req.body;

        const numericUserId = parseInt(userId, 10);

        if (!numericUserId || !message) {
            throw new AppError(
                "Valid numeric userId and message are required",
                StatusCodes.BAD_REQUEST
            );
        }

        // 1. Save user message
        await prisma.chatMessage.create({
            data: {
                userId: numericUserId,
                role: MessageRole.USER,
                content: message
            }
        });

        // 2. Get last 10 messages
        const rawMessages = await prisma.chatMessage.findMany({
            where: {
                userId: numericUserId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10
        });

        // console.log("Raw messages:", rawMessages);

        // 3. Reverse because database gives newest first
        const messages: ChatMessagePayload[] = rawMessages
            .reverse()
            .map((item) => ({
                role: toChatMessageRole(item.role),
                content: item.content
            }));

        // 4. Setup SSE headers
        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.setHeader(
            "X-Accel-Buffering",
            "no"
        );

        // Immediately send headers
        res.flushHeaders();

        // 5. Create Groq stream
        const stream = await createChatStream(messages);

        let fullAiResponse = "";

        // 6. Stream response token by token
        for await (const chunk of stream) {

            const content =
                chunk.choices[0]?.delta?.content || "";

            // console.log("Chunk:", content);

            if (content) {

                fullAiResponse += content;

                res.write(
                    `data: ${JSON.stringify({
                        content
                    })}\n\n`
                );
            }
        }

        // console.log(
        //     "Full AI response:",
        //     fullAiResponse
        // );

        // 7. Save AI response
        await prisma.chatMessage.create({
            data: {
                userId: numericUserId,
                role: MessageRole.ASSISTANT,
                content: fullAiResponse
            }
        });

        // 8. Tell frontend streaming is finished
        res.write(
            `data: ${JSON.stringify({
                done: true
            })}\n\n`
        );

        // 9. Close connection
        res.end();

    } catch (error) {

        // console.error(
        //     "Chat stream error:",
        //     error
        // );

        if (!res.headersSent) {

            res.status(500).json({
                message: "Failed to generate AI response"
            });

        } else {

            res.end();
        }
    }
}