import { getDevicesByNameGrpc } from "../../services/getDevicesGrpc.service";

interface FindDeviceInput {
    applicationId: string;
    deviceName: string;
}

interface DeviceOutput {
    found: boolean;
    deviceName: string;
    devEui: string;
}

export async function findDevEuiByNameInApp(
    input: FindDeviceInput
): Promise<DeviceOutput> {

    const { applicationId, deviceName } = input;

    const result = await getDevicesByNameGrpc(
        applicationId,
        deviceName
    );

    if (!result || !result.resultList || result.resultList.length === 0) {
        return {
            found: false,
            deviceName,
            devEui: ""
        };
    }

    const device = result.resultList[0];

    return {
        found: true,
        deviceName: device.name,
        devEui: device.devEui
    };
}