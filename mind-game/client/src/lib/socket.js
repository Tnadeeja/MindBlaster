import { io } from "socket.io-client";

// If your server runs elsewhere, change the URL:
export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});
