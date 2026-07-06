import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { createIoTAgent } from "../ai/aegent.ai";

export class ChatController {
  // 1. Helper function needs to be an arrow function or static helper
  static sendEvent = (res: Response, data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 2. Turn the main controller method into an arrow function to preserve 'this'
  static chat = async (req: Request, res: Response) => {
    try {
      const application = req.applicationId;
      console.log("this user is using the agentss to work ", application);

      if (!application) {
        throw new AppError("please login again!", StatusCodes.BAD_REQUEST);
      }
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      // Initialize SSE Stream
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Now 'this' refers securely to the ChatController class
      this.sendEvent(res, { type: "thinking" });

      const agent = createIoTAgent(application);
      const stream = await agent.stream(
        { messages: [{ role: "user", content: message }] },
        { streamMode: ["updates"] }
      );

for await (const chunk of stream) {
  const [mode, data] = chunk;
  if (mode !== "updates" || !data) continue;

  console.log("Stream update block:", JSON.stringify(data));

  // 1. FIXED: Look for "model_request" instead of "agent"
  if ("model_request" in data) {
    const nodeUpdate = (data as any).model_request;
    const messages = Array.isArray(nodeUpdate.messages) ? nodeUpdate.messages : [nodeUpdate.message];
    const rawMessage = messages?.[messages.length - 1];

    if (rawMessage) {
      // LangChain messages wrap actual fields inside 'kwargs' when using classes
      const aiMessage = rawMessage.kwargs ? rawMessage.kwargs : rawMessage;

      // Handle tool calls
      if (aiMessage.tool_calls?.length) {
        for (const tool of aiMessage.tool_calls) {
          this.sendEvent(res, { type: "tool_start", tool: tool.name });
        }
      } 
      
      // Handle final text content
      if (aiMessage.content) {
        const textContent = typeof aiMessage.content === "string" 
          ? aiMessage.content 
          : Array.isArray(aiMessage.content) 
            ? aiMessage.content.map((c: any) => c.text || "").join("")
            : "";

        if (textContent.trim().length > 0) {
          this.sendEvent(res, {
            type: "assistant",
            content: textContent
          });
        }
      }
    }
  }

  // 2. Handle Tools node updates
  if ("tools" in data) {
    const toolsUpdate = (data as any).tools;
    const messages = Array.isArray(toolsUpdate.messages) ? toolsUpdate.messages : [toolsUpdate.message];
    const rawTool = messages?.[messages.length - 1];
    const toolMessage = rawTool?.kwargs ? rawTool.kwargs : rawTool;

    if (toolMessage) {
      this.sendEvent(res, {
        type: "tool_finish",
        tool: toolMessage.name || "tool"
      });
    }
  }
}
      
      res.end();

    } catch (err: any) {
      console.error(err);

      // Fix: If headers are already sent, don't try to send res.json()
      if (res.headersSent) {
        this.sendEvent(res, { type: "error", message: err.message || "Stream interrupted" });
        return res.end();
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.message || "Something went wrong"
      });
    }
  };
}