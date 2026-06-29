// here i need to  write all    interface of for the for the ai



// this will be an array formate so what ever message willcome
export interface Message {
    role: "system" | "user"| "assistant",
    content :string
}


export interface ToolResponse {
    tool:string,
    arguments:Record<string,any>,
    error?:string
}
