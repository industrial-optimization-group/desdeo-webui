import skio from "$lib/socket.js";
import type { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io-client";

if (!skio.started()) {
  skio
    .setup(null, {
      cors: {
        transports: ["websocket"],
        "force new connection": true,
        credentials: true,
      },
    })
    .then((socket: Socket | SocketIOServer) => {
      (socket as Socket).on("connect", () => {
        if (socket) {
          (socket as Socket).off("message").on("message", (message) => {
            console.log(message);
          });

          socket.on("disconnect", () => {
            console.log("Server: disconnected");
            socket.close();
          });
        }
      });
    });
}
