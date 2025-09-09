// SocketProvider.jsx
import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // Use full URL with protocol
  const socket = useMemo(() => {
    const s = io("http://localhost:8000", {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    s.on("connect_error", (err) => console.error("socket connect_error", err));
    return s;
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
