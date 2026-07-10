import { application } from "express"
import { getDevicesGrpc } from "./getDevicesGrpc.service"

const syncAlldevices = async (Application:String) => {

    const devices = await getDevicesGrpc(
        application,
        "100",
        "0"
    )
    
}