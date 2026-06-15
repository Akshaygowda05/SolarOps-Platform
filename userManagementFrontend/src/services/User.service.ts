import type { CreateUserData, SchedularData } from "../utils/interfaces";
import { api } from "./api"



 // this is for the login
export const login = async(email:string, password:string)=>{
    return await api.post("/v1/user/login", {email, password});
}


// this is for the create user
export const createUser = async (data:CreateUserData)=>{
    return await api.post("/v1/users/create", data);
}

// this is for the fetch the devices

export const fetchdevices = async (limit: number, offset: number,search:string) => {
    return await api.get("/devices", {
        params: {
            limit,
            offset,
            search
        }
    });
}

// this is for the fetch the multicast group

export const fetchMulticastGroups = async (limit?: number, offset?: number) => {
    return await api.get("/multicast-groups",{
        params:{
            limit,
            offset
        }
    })
}

// this is for the fetch the battery 
export const fetchBatteryStatus  = async (groupId:string) =>{
    return await api.get(`/v1/batteries/${groupId}`);
}

// this is to fetch the group details for the group of devices

export const fetchGroup = async () =>{
    return  await api.get("/multicast-groups");
}

// this is send the downlink for the group of devices
export const multicastDownlink = async (groupIds:string[], groupName:string[], data:string) =>{
    return await api.post("/multicast-groups/queue", {
        groupId: groupIds,
        groupName,
        data
    });
}

// this is for the sending downlink to the ind devices


export const unicastDownlink =async(devEui:string,data:string,name:string) =>{

    return await api.post(`/devices/${devEui}/queue`,{
        data,
        name
    })
}



export const fetchBattery = async (groupId:string) =>{
    return await api.get(`/v1/batteries/${groupId}`);
}


// this to fetch the devies for the home page dashboard
export const fetchDevicesV1=async () =>{
    console.log("Fetching devices from API...");
    return await api.get("/v1/devices");
}

// this is for the home page pannels data
export const getHomePannelsCleandata =async() =>{
    return await api.get("/home/pannels-data");
}
// this for the home page for the average battery discharge of the devices in the group
export const getAvgBatteryDischarge = async() =>{
    return await api.get("/home/avg-battery-discharge");
}

// this is also for the homepae for the active and inactive devices

export const getActiveInactiveCount = async() =>{
    return await api.get("/home/active-inactive-count");

}

export const getApplicationLogs = async () => {
    return await api.get("/events");
}

export const deleteUser = async (userId: number) => {
    return await api.delete(`/v1/users/delete/${userId}`);
}




export const fetchUserById = async (userId: number) => {
    const response = await api.get(`/v1/users/${userId}`);
    return response.data; // Directly returns the user object payload
};

/**
 * Update a user's profile details (Name, Email, Role, Status)
 */
export const updateUser = async (userId: number, data: any) => {
    const response = await api.put(`/v1/users/${userId}`, data);
    return response.data; // Directly returns the updated user database row
};

/**
 * Force update a user's password securely
 */
export const updateUserPassword = async (userId: number, newPassword: string) => {
    // FIX: Body key matches 'newPassword' exactly as your backend Service expects it
    const response = await api.put(`/v1/users/password/${userId}`, { 
        newPassword: newPassword 
    });
    return response.data; // Directly returns the success payload
};

export const fetchDataofRobot = async(devEui:string) =>{
    return  await api.get(`v1/device/${devEui}/data`)
}  

export const getCoreHealth =() =>{
    return api.get("/health");
}

export const getGateway = async () =>{
    const res = await api.get("/ApplicationGateways");
    console.log("Gateways response:", res.data); // Debug log to check the response
    return res.data;
}

export const allGateways = async () =>{
    const res = await api.get("/allGateways");
    console.log("All Gateways response:", res.data); // Debug log to check the response
    return res.data;
}

export const fetchSchedularData = async () =>{
    const res = await api.get("/get/schedulers");
    return res.data;
}

export const createSchedular = async (data:SchedularData) =>{
    return await api.post("/create/scheduler", data);
}


export const deleteSchedular = async (id:Number) =>{
    return await api.delete(`/delete/scheduler/${id}`);
}



export const fetchErrorLogs = async () =>{
    return await api.get("/errors");
}

export const fetchSiteConfigStatus = async () => {
    return await api.get("/v1/site-config/status");
}

export const updateSiteConfig = async (configData: any) => {
    return await api.put("/v1/site-config", configData);
}

export const getsiteConfig = async () =>{
    return await api.get("/v1/site-config");
}

export const fetchReports = async (groupId: string, startDate: string, endDate?: string) => {
    return await api.get("/reports/data", {
        params: {
            multicast: groupId,  // ← this is what backend expects
            startDate,
            ...(endDate && { endDate })
        }
    });
}
export const fetchSummary = async (startDate: string, endDate?: string) => {
    return await api.get("/reports/total-panels-cleaned", {
        params: {   
            startDate,
            ...(endDate && { endDate }) 
        }
    });
}
