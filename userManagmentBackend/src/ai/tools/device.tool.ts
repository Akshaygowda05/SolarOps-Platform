export const devicetools = [
    {
        type: "function " as const,
        function: {
            name: "find_device_by_name" ,

            description:
               `Find a robot or device using the name mentioned by the user.
Use this tool when the user mentions a specific robot or device
and asks to find it or get information about it.`,

            parameters: {
                type: "object",

               properties: {
                    deviceName: {
                        type: "string",

                        description:
                            "The exact robot or device name mentioned by the user"
                    }
                },

                required: [
                    "deviceName"
                ]
            }
        }
    }
];