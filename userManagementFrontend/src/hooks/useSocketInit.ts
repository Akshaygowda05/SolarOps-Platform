import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import { connectSocket, disconnectSocket } from "../services/sockets";
import { selectedApplicationState } from "../store/authState";

export const useSocketInit = () => {
  const auth = useRecoilValue(authState);
  const selectedAppId = useRecoilValue(selectedApplicationState);

useEffect(() => {
  if (!auth.initialized) return;

  if (!auth.token) {
    disconnectSocket();
    return;
  }

  if (
    auth.role === "ADMIN" &&
    !selectedAppId
  ) {
    disconnectSocket();
    return;
  }

  connectSocket(
    auth.token,
    auth.role === "ADMIN"
      ? selectedAppId!
      : undefined
  );

  return () => {
    disconnectSocket();
  };
}, [
  auth.token,
  auth.role,
  auth.initialized,
  selectedAppId
]);
};