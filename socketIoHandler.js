import { Server } from "socket.io";

export default function injectSocketIO(server) {
  const io = new Server(server);

  const actions = new Map();
  const actionTimeouts = new Map();

  io.on("connect", (socket) => {
    socket.on("message", (message) => {
      console.log(socket.id, "Server: Client sent:", message);
    });

    socket.on("join-room", (username, roomID) => {
      io.of("/").adapter.sids.set(socket.id, new Set());
      socket.join(roomID);

      socket.to(roomID).emit("message", {
        message: `Server: ${username} JOINED room ${roomID}`,
      });

      console.log("rooms", io.of("/").adapter.rooms);

      const dmIds = io.of("/").adapter.rooms.get(roomID) || new Set();

      if (dmIds.size === 0) {
        if (!actions.has(roomID)) {
          actions.set(roomID, new Map());
          actionTimeouts.set(roomID, undefined);
        }
      }
    });

    socket.on("leave-room", (username, roomID) => {
      socket.leave(roomID);
      socket.to(roomID).emit("message", {
        message: `Server: ${username} LEFT room ${roomID}`,
      });
      console.log("rooms", io.of("/").adapter.rooms);

      const dmIds = io.of("/").adapter.rooms.get(roomID) || new Set();

      if (dmIds.size === 0) {
        actions.set(roomID, new Map());
      }
    });

    socket.on("add-action", (action, requestId) => {
      const executeAction = (requestIds) => {
        console.log("executeAction", requestIds);
        socket.to(roomID).emit("message", {
          message: `Server: ${socket.id} about to execute action ${action}`,
        });
        socket.emit(`execute-${action}`, requestIds);
        socket
          .to(roomID)
          .emit(`executing-${action}`, { message: `Conducting ${action}` });
      };

      if (requestId < 0 || !action) {
        return;
      }

      const [roomID] = io.of("/").adapter.sids?.get(socket.id) || new Set();

      clearTimeout(actionTimeouts.get(roomID));

      if (!actions.has(roomID)) {
        actions.set(roomID, new Map());
      }

      if (!actions.get(roomID)?.has(action)) {
        actions.get(roomID)?.set(action, new Map());
      }

      if (action === "initialize") {
        const requestIds = new Set([
          ...(actions.get(roomID)?.get(action) || new Map()).values(),
        ]);

        if (requestIds.size == 0) {
          actions?.get(roomID)?.get(action)?.set(socket.id, requestId);
          socket.emit(`execute-${action}`, requestIds);
        } else if (!requestIds.has(0)) {
          socket.emit(`executed-action`, action, requestIds);
        }

        return;
      }

      actions?.get(roomID)?.get(action)?.set(socket.id, requestId);

      socket.to(roomID).emit("message", {
        message: `Server: ${socket.id} added action ${action}`,
      });

      const dmIds = io.of("/").adapter.rooms.get(roomID) || new Set();
      const submittedIds = [
        ...(actions.get(roomID)?.get(action) || new Map()).keys(),
      ];
      const requestIds = [
        ...(actions.get(roomID)?.get(action) || new Map()).values(),
      ];

      console.log("DMs in the room:", dmIds);
      console.log("Submitted action", action, actions.get(roomID)?.get(action));

      if ([...dmIds].every((value) => submittedIds.includes(value))) {
        clearTimeout(actionTimeouts.get(roomID));

        executeAction(requestIds);
      } else {
        socket.emit("message", {
          message: `Server: Wait for other DMs....`,
        });
        actionTimeouts.set(
          roomID,
          setTimeout(executeAction, 600000, requestIds)
        );
      }
    });

    socket.on("failed-action", (action) => {
      const [roomID] = io.of("/").adapter.sids?.get(socket.id) || new Set();

      socket.to(roomID).emit("message", {
        message: `Server: Action ${action} failed!`,
      });
    });

    socket.on("finish-action", (action) => {
      const [roomID] = io.of("/").adapter.sids.get(socket.id) || new Set();
      const requestIds = [
        ...(actions.get(roomID)?.get(action) || new Map()).values(),
      ];
      const dmIds = io.of("/").adapter.rooms.get(roomID) || new Set();

      if (dmIds.size > 1) {
        socket.to(roomID).emit(`executed-action`, action, requestIds);
      }

      if (action === "initialize") {
        actions.get(roomID)?.get(action)?.set(socket.id, 1);
      } else {
        actions.get(roomID)?.set(action, new Map());
      }
    });

    socket.on("disconnect", () => {
      console.log("Server: ", socket.id, "disconnected");
    });
  });

  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  });

  console.log("SocketIO injected");
}
