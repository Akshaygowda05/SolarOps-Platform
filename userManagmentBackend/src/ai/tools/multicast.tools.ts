import { tool } from "@langchain/core/tools";
import { z } from "zod";    
import { downlinkMulticast, serachMulticastSerach } from "../../Aifunction/mulitcast.function";

export function sendDownlinkToMulticastGroup(applicationId: string) {
  return tool(
    async ({ multicastId, data }) => {
      try {
        const response = await downlinkMulticast(applicationId, multicastId, data);
        return JSON.stringify({
          status: "success",
          message: "Downlink command sent to multicast group successfully.",
          data: response
        });
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: `Failed to send downlink to multicast group: ${error.message || error}`
        });
      }
    },
    {
      name: "sendDownlinkToMulticastGroup",
      description: `Send start, stop, reboot, or return-to-dock commands to a multicast group.
IMPORTANT: This tool requires a multicastId (ID), not the group name. If the user provides a group name (e.g. "Block 1" or "Phase 1"), you must first search for the ID using the getMulticastIdByName tool.`,
      schema: z.object({
        multicastId: z.string().describe("The unique ID of the multicast group. If only the name is known, call getMulticastIdByName first to find the ID."),
        data: z.string().describe("The command/payload data to send (e.g. start, stop, return-to-dock, reboot).")
      })
    }
  );
}

export  function getMulticastIdByName(applicationId: string) {
  return tool(
    async ({}) => {
      try {
        const groups = await serachMulticastSerach(applicationId);
        if (!Array.isArray(groups)) {
          return JSON.stringify({
            status: "error",
            message: "Unable to retrieve multicast groups list."
          });
        }

        return JSON.stringify({
          status: "success",
          groups: groups.map((g: any) => ({ id: g.id, name: g.name }))
        });
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: `Failed to retrieve multicast groups: ${error.message || error}`
        });
      }
    },
    {
      name: "getMulticastIdByName",
      description: "Retrieve all multicast groups (including their IDs and names) so the LLM can match the group name requested by the user.",
      schema: z.object({})
    }
  );
}