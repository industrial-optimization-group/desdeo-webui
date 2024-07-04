import skio from "$lib/socket.js";

if (!skio.started()) {
  skio
    .setup("http://localhost:3001", {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
        transports: ["websocket"],
        "force new connection": true,
      },
    })
    .then((io) => {
      io.on("connect", (socket) => {
        if (socket) {
          socket.on("message", (message) => {
            console.log(message);
          });

          socket.on("disconnect", () => {
            console.log("client:", socket.id, "disconnected.");
            skio.close();
          });
        }
      });
    });
}
