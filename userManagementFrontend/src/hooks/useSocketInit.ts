import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import { connectSocket, disconnectSocket } from "../services/sockets";

export const useSocketInit = () => {
  const auth = useRecoilValue(authState);

  useEffect(() => {
    if (!auth.initialized) return;

    if (auth.token) {
      console.log("🔌 Connecting socket...");
      connectSocket(auth.token);
    } else {
      console.log("🔌 Disconnecting socket...");
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [auth.token, auth.initialized]);
};