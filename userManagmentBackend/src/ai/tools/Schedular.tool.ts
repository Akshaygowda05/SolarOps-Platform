import { tool } from "langchain";
import { z } from "zod";
import { SchedulerServiceInstance } from "../../services/schedular.service";
import { serachMulticastSerach } from "../../chripstackfunction/mulitcast.function";

// 1. GET SCHEDULER TOOL (Looking Good!)
export const getschedulartool = (applicationId: string) => {
  return tool(
    async () => {
      console.log("👉 INSIDE TOOL - Application ID:", applicationId);
      try {
        const schedular = await SchedulerServiceInstance.getScheduler(applicationId);
        console.log("👉 SERVICE RESPONSE:", schedular);
        return JSON.stringify(schedular);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: `The scheduler service failed to fetch data internally: ${error.message || error}`
        });
      }
    },
    {
      name: "getSchedular",
      description: "Returns all schedulers. Requires no arguments from the user.",
      schema: z.object({}),
    }
  );
};

// 2. SEARCH MULTICAST GROUPS TOOL
export function searchMulticastGroupsTool(applicationId: string) {
  return tool(
    async ({ query }) => {
      try {
        const groups = await serachMulticastSerach(applicationId, query);

        // service returns { success: false, message } on no matches
        if (!Array.isArray(groups) && groups?.success === false) {
          return JSON.stringify({
            status: "error",
            message: groups.message
          });
        }

        return JSON.stringify({
          status: "success",
          message: "Multicast groups retrieved successfully.",
          data: groups
        });
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: `Failed to search multicast groups: ${error.message || error}`
        });
      }
    },
    {
      name: "searchMulticastGroups",
      description: "Search multicast groups by name.",
      schema: z.object({
        query: z.string().describe("Name of the multicast group to search for"),
      }),
    }
  );
}

// 3. CREATE SCHEDULER TOOL
export function createSchedularTool(applicationId: string) {
  return tool(
    async ({ groups, action, jobType, time }) => {
      try {
        const payloadMap: Record<string, string> = {
          start: "Ag==",
          stop: "Aw==",
          dock: "BA==",
          return: "BQ==",
        };

        const data = payloadMap[action];

        const response = await SchedulerServiceInstance.createScheduler(
          applicationId,
          {
            time,
            data,
            groups,
            jobType
          }
        );

        return JSON.stringify({
          status: "success",
          message: "Scheduler created successfully!",
          data: response
        });
      } catch (error: any) {
        // Catching the service validation errors so the LLM can see them!
        return JSON.stringify({
          status: "error",
          message: `Failed to create scheduler: ${error.message || error}`
        });
      }
    },
    {
      name: "createSchedular",
      description: "Create a scheduler for one or more multicast groups.",
      schema: z.object({
        groups: z.array(
          z.object({
            id: z.string().describe("The unique ID of the multicast group"),
            name: z.string().describe("The name of the multicast group"),
          })
        ),
        time: z.string().describe("ISO date/time string for when the scheduler should run"),
        action: z.enum(["start", "stop", "dock", "return"]).describe("The command action to send to the machine"),
        jobType: z.enum(["ONE_TIME", "DAILY"]).optional().default("ONE_TIME"),
      }),
    }
  );
}