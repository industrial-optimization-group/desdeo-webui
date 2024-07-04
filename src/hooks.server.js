import skio from "$lib/socket.js";

skio
  .setup("http://localhost:3001", {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  })
  .then((io) => {
    io.on("connect", (socket) => {
      io.of("/").adapter.actions = new Map();

      socket.on("message", (message) => {
        console.log(socket.id, "Server: Client sent:", message);
      });

      socket.on("join-room", (username, roomID) => {
        io.of("/").adapter.sids.set(socket.id, new Set());
        socket.join(roomID);

        socket.to(roomID).emit("message", {
          message: "Server: " + username + " joined room " + roomID,
        });

        console.log("rooms", io.of("/").adapter.rooms);
      });

      socket.on("leave-room", (username, roomID) => {
        socket.leave(roomID);
        socket.to(roomID).emit("message", {
          message: "Server: " + username + " leave room " + roomID,
        });
        console.log("rooms", io.of("/").adapter.rooms);
      });

      socket.on("add-action", (action, requestId) => {
        let [roomID] = io.of("/").adapter.sids.get(socket.id);

        if (!io.of("/").adapter.actions.has(roomID)) {
          io.of("/").adapter.actions.set(roomID, new Map());
        }

        if (!io.of("/").adapter.actions.get(roomID).has(action)) {
          io.of("/").adapter.actions.get(roomID).set(action, new Map());
        }

        io.of("/")
          .adapter.actions.get(roomID)
          .get(action)
          .set(socket.id, requestId);

        socket.to(roomID).emit("message", {
          message: "Server: " + socket.id + " added action " + action,
        });

        const dmIds = io.of("/").adapter.rooms.get(roomID);
        const submittedIds = [
          ...io.of("/").adapter.actions.get(roomID).get(action).keys(),
        ];
        const requestIds = [
          ...io.of("/").adapter.actions.get(roomID).get(action).values(),
        ];

        console.log("DMs in the room:", dmIds);
        console.log(
          "Submitted action",
          action,
          io.of("/").adapter.actions.get(roomID).get(action)
        );

        if ([...dmIds].every((value) => submittedIds.includes(value))) {
          socket.emit("execute-" + action, requestIds);
          socket
            .to(roomID)
            .emit("executing-" + action, { message: "Conducting " + action });

          if (dmIds.size > 1) {
            socket.once("finish-execute-" + action, () => {
              socket.to(roomID).emit("executed-" + action, requestIds);
              io.of("/").adapter.actions.get(roomID).set(action, new Map());
            });
          }
        }
      });

      socket.on("disconnect", () => {
        console.log("Server: ", socket.id, "disconnected");
      });
    });

    io.of("/").adapter.on("join-room", (room, id) => {
      console.log(`socket ${id} has joined room ${room}`);
    });
  });
