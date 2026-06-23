import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import { connectSocket, disconnectSocket } from "../services/sockets";

export const useSocketInit = () => {
  const auth = useRecoilValue(authState);

  useEffect(() => {
    if (!auth.initialized) return;

    if (!auth.token) {
      console.log("🔌 No token found. Disconnecting socket...");
      disconnectSocket();
      return;
    }

    let appIdToConnect: string | undefined = undefined;

    if (auth.role === "ADMIN") {
      const savedAppId = localStorage.getItem("selectedApplicationId");
      if (!savedAppId) {
        console.log("⚠️ No application selected for ADMIN");
        return; 
      }
      appIdToConnect = savedAppId;
    }

    console.log("🔌 Connecting socket...");
    connectSocket(auth.token, appIdToConnect);

    return () => {
      console.log("🧹 Cleaning up socket connection...");
      disconnectSocket();
    };
  }, [auth.token, auth.role, auth.initialized]); // Added auth.role to dependencies
};