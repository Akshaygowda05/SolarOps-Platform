import { jarvisTypes } from "./ai.types";

export interface ToolContext {
    applicationId: string;
    userId?: string;
    tenantId?: string;
    [key: string]: any;
}

export interface AgentTool<TArgs = any, TResult = any> {
    name: string;
    description: string;
    intents: jarvisTypes[];
    parameters: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
    execute: (args: TArgs, context: ToolContext) => Promise<TResult>;
}

export interface OpenAIToolFormat {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}

export class ToolRegistry {
    private tools = new Map<string, AgentTool>();

    /**
     * Register a new tool into the system
     */
    register(tool: AgentTool): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Get a tool by its exact name
     */
    getTool(name: string): AgentTool | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all registered tools
     */
    getAllTools(): AgentTool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get tools formatted for Groq / OpenAI completions API, filtered by Intent.
     * Prevents context window explosion and model confusion when having 100+ tools.
     *
     * @param intent The detected user intent
     * @param limit Maximum tools to return in a single prompt (default: 6)
     */
    getToolsForIntent(intent?: jarvisTypes, limit = 6): OpenAIToolFormat[] {
        let matchingTools: AgentTool[] = [];

        if (intent && intent !== jarvisTypes.OUT_OF_SCOPE) {
            matchingTools = Array.from(this.tools.values()).filter(tool =>
                tool.intents.includes(intent)
            );
        }

        // If no tools match the specific intent or no intent provided, fallback to common device tools
        if (matchingTools.length === 0) {
            matchingTools = Array.from(this.tools.values());
        }

        return matchingTools.slice(0, limit).map(tool => ({
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));
    }

    /**
     * Dynamically execute a tool call requested by the LLM
     */
    async execute(name: string, argsInput: any, context: ToolContext): Promise<any> {
        const tool = this.tools.get(name);

        if (!tool) {
            return {
                found: false,
                error: `Tool "${name}" is not registered in the system.`
            };
        }

        let parsedArgs: any = {};
        if (typeof argsInput === "string") {
            try {
                parsedArgs = JSON.parse(argsInput || "{}");
            } catch (err: any) {
                return {
                    found: false,
                    error: `Invalid JSON parameters provided for tool "${name}": ${err?.message}`
                };
            }
        } else if (typeof argsInput === "object" && argsInput !== null) {
            parsedArgs = argsInput;
        }

        try {
            return await tool.execute(parsedArgs, context);
        } catch (err: any) {
            console.error(`Error executing tool "${name}":`, err);
            return {
                found: false,
                error: `Error executing tool "${name}": ${err?.message || String(err)}`
            };
        }
    }
}

export const toolRegistry = new ToolRegistry();
