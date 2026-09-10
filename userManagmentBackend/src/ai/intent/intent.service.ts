import Groq from "groq-sdk";
import envconfig from "../../config/envConfig";
import { jarvisTypes } from "../ai.types";
import { ChatMessagePayload, ChatMessageRole } from "../../services/ai.service";
import { toolRegistry } from "../tool.register";
import "../tools/device.tool"; // Ensure all device tools are registered into toolRegistry
import { devicetools } from "../tools/device.tool";

const client = new Groq({
    apiKey: envconfig.getLllmApiKey()
});

export class IntetnService {
    async classify(message: string): Promise<jarvisTypes> {
        try {
            const response = await client.chat.completions.create({
                model: "openai/gpt-oss-20b",
                temperature: 0,
                messages: [
                    {
                        role: "system",
                        content: `You are an intent classifier for AegeusConnect JARVIS.

Your job is ONLY to classify the user's message.

Return exactly one of the following values:

DEVICE_STATUS
DEVICE_ANALYTICS
GATEWAY_STATUS
SCHEDULARS
REPORTS
TELEMETRY
PLATFORM_HELP
OUT_OF_SCOPE

Classification rules:

DEVICE_STATUS:
Questions about robot or device online/offline status,
battery status, current device state.

SCHEDULARS:
Question about setting the scheduler, editing, deleting,
either block-wise or robot-wise.

DEVICE_ANALYTICS:
Questions about device performance, trends,
statistics, historical device analysis.

GATEWAY_STATUS:
Questions about LoRaWAN gateways,
gateway connectivity or gateway information.

REPORTS:
Questions about panels cleaned,
daily reports, historical reports,
analytics summaries.

TELEMETRY:
Questions about telemetry values,
sensor data, odometer, battery voltage,
device messages.

PLATFORM_HELP:
Questions about how to use AegeusConnect
and its features.

OUT_OF_SCOPE:
Everything unrelated to AegeusConnect.

Return ONLY the intent name.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            });

            const intent = response.choices[0]?.message?.content?.trim();

            if (intent && Object.values(jarvisTypes).includes(intent as jarvisTypes)) {
                return intent as jarvisTypes;
            }

            return jarvisTypes.OUT_OF_SCOPE;
        } catch (err) {
            console.error("Error in intent classification:", err);
            return jarvisTypes.OUT_OF_SCOPE;
        }
    }
}

export async function createChatStream(
    messages: ChatMessagePayload[],
    model: string = "openai/gpt-oss-20b"
) {
    const systemPrompt: ChatMessagePayload = {
        role: ChatMessageRole.system,
        content: `You are JARVIS for AegeusConnect solar panel cleaning robots.
When the user mentions a specific robot or device, use the available tools to get live data.
Do not invent device names or metrics.`
    };

    return await client.chat.completions.create({
        model,
        messages: [systemPrompt, ...messages],
        stream: true,
        tools: devicetools,
        tool_choice: "auto"
    });
}

/**
 * Autonomous Multi-Step Agent Chat Stream
 *
 * 1. Filters tools dynamically based on user's intent (preventing context bloat when scaling to 100+ tools).
 * 2. Implements a multi-turn ReAct agent loop: LLM can call tools sequentially (e.g. resolve name -> fetch battery).
 * 3. Streams text tokens smoothly to the SSE client.
 */
export async function* streamAgentChat({
    applicationId,
    message,
    intent,
    userId,
    model = "openai/gpt-oss-20b"
}: {
    applicationId: string;
    message: string;
    intent?: jarvisTypes;
    userId?: string;
    model?: string;
}) {
    // 1. Resolve intent to filter relevant tools from the registry
    let detectedIntent = intent;
    if (!detectedIntent) {
        const classifier = new IntetnService();
        detectedIntent = await classifier.classify(message);
    }

    // 2. Retrieve only the tools relevant to this intent (max 6)
    const availableTools = toolRegistry.getToolsForIntent(detectedIntent);

    const systemPrompt = {
        role: "system" as const,
        content: `You are JARVIS, an intelligent AI operations assistant for AegeusConnect solar panel cleaning robots.
You have access to tools to fetch live robot data, battery voltage, telemetry, and device information.
When the user asks about a robot, use the appropriate tool to retrieve its live status or telemetry.
Always format battery and robot status clearly for the user. Do not fabricate or hallucinate robot details.`
    };

    const messages: any[] = [
        systemPrompt,
        { role: "user" as const, content: message }
    ];

    const MAX_STEPS = 5;
    let step = 0;

    while (step < MAX_STEPS) {
        step++;

        const stream = (await client.chat.completions.create({
            model,
            messages,
            stream: true,
            ...(availableTools.length > 0 ? { tools: availableTools, tool_choice: "auto" } : {})
        })) as AsyncIterable<any>;

        const toolCalls: any[] = [];

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            // Stream text content to user
            if (delta?.content) {
                yield delta.content;
            }

            // Accumulate tool calls across chunks
            if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                    const idx = tc.index ?? 0;
                    if (!toolCalls[idx]) {
                        toolCalls[idx] = {
                            id: tc.id || "",
                            type: "function",
                            function: {
                                name: tc.function?.name || "",
                                arguments: tc.function?.arguments || ""
                            }
                        };
                    } else {
                        if (tc.id) toolCalls[idx].id = tc.id;
                        if (tc.function?.name) toolCalls[idx].function.name += tc.function.name;
                        if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
                    }
                }
            }
        }

        // If no tool was requested by the model, the response is finished
        if (toolCalls.length === 0) {
            break;
        }

        // Record assistant tool calls in conversation history
        messages.push({
            role: "assistant",
            content: null,
            tool_calls: toolCalls
        });

        // Execute all requested tools via the Tool Registry
        for (const tc of toolCalls) {
            const toolResult = await toolRegistry.execute(
                tc.function?.name,
                tc.function?.arguments,
                { applicationId, userId }
            );

            messages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify(toolResult)
            });
        }

        // Loop continues to next step so LLM can inspect tool results and either
        // call the next tool or stream the final answer
    }
}
