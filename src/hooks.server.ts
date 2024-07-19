import skio from "$lib/socket.js";
import type { Server, Socket } from "socket.io";
import type { Socket as SocketClient } from "socket.io-client";

skio
  .setup("http://localhost:3001", {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  })
  .then((io: Server | SocketClient) => {
    const actions: Map<string, Map<string, Map<string, number>>> = new Map();

    (io as Server).on("connect", (socket: Socket) => {
      socket.on("message", (message: string) => {
        console.log(socket.id, "Server: Client sent:", message);
      });

      socket.on("join-room", (username: string, roomID: string) => {
        (io as Server).of("/").adapter.sids.set(socket.id, new Set());
        socket.join(roomID);

        socket.to(roomID).emit("message", {
          message: `Server: ${username} JOINED room ${roomID}`,
        });

        console.log("rooms", (io as Server).of("/").adapter.rooms);
      });

      socket.on("leave-room", (username: string, roomID: string) => {
        socket.leave(roomID);
        socket.to(roomID).emit("message", {
          message: `Server: ${username} LEFT room ${roomID}`,
        });
        console.log("rooms", (io as Server).of("/").adapter.rooms);
      });

      socket.on("add-action", (action: string, requestId: number) => {
        if (!requestId || !action) {
          return;
        }

        const [roomID] =
          (io as Server).of("/").adapter.sids?.get(socket.id) || new Set();

        if (!actions.has(roomID)) {
          actions.set(roomID, new Map());
        }

        if (!actions.get(roomID)?.has(action)) {
          actions.get(roomID)?.set(action, new Map());
        }

        actions?.get(roomID)?.get(action)?.set(socket.id, requestId);

        socket.to(roomID).emit("message", {
          message: `Server: ${socket.id} added action ${action}`,
        });

        const dmIds =
          (io as Server).of("/").adapter.rooms.get(roomID) || new Set();
        const submittedIds = [
          ...(actions.get(roomID)?.get(action) || new Map()).keys(),
        ];
        const requestIds = [
          ...(actions.get(roomID)?.get(action) || new Map()).values(),
        ];

        console.log("DMs in the room:", dmIds);
        console.log(
          "Submitted action",
          action,
          actions.get(roomID)?.get(action)
        );

        if ([...dmIds].every((value) => submittedIds.includes(value))) {
          socket.emit(`execute-${action}`, requestIds);
          socket
            .to(roomID)
            .emit(`executing-${action}`, { message: `Conducting ${action}` });
        }
      });

      socket.on("failed-action", (action: string) => {
        const [roomID] =
          (io as Server).of("/").adapter.sids?.get(socket.id) || new Set();

        socket.to(roomID).emit("message", {
          message: `Server: Action ${action} failed!`,
        });
      });

      socket.on("finish-action", (action: string) => {
        const [roomID] =
          (io as Server).of("/").adapter.sids.get(socket.id) || new Set();
        const requestIds = [
          ...(actions.get(roomID)?.get(action) || new Map()).values(),
        ];
        const dmIds =
          (io as Server).of("/").adapter.rooms.get(roomID) || new Set();

        if (dmIds.size > 1) {
          socket.to(roomID).emit(`executed-${action}`, requestIds);
        }

        actions.get(roomID)?.set(action, new Map());
      });

      socket.on("disconnect", () => {
        console.log("Server: ", socket.id, "disconnected");
      });
    });

    (io as Server)
      .of("/")
      .adapter.on("join-room", (room: string, id: string) => {
        console.log(`socket ${id} has joined room ${room}`);
      });
  });
