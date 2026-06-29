import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getSchedulersTool = tool(
  async () => {
    return JSON.stringify([
      {
        id: 1,
        name: "Morning Scheduler",
      },
      {
        id: 2,
        name: "Night Scheduler",
      },
    ]);
  },
  {
    name: "getSchedulers",
    description: "Returns all schedulers.",
    schema: z.object({}),
  }
);