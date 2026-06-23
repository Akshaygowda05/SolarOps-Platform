import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token?: string, selectedAppId?: string) => {
  // If a socket is already connected, disconnect it first to avoid duplicates
  if (socket) {
    socket.disconnect();
  }

  socket = io("http://localhost:3000", {
    auth: {
      token,
      selectedAppId,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};