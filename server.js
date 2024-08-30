import http from "http";
import { handler } from "./build/handler.js"; // Import SvelteKit handlers
import { env } from "./build/env.js"; // Import SvelteKit handlers
import injectSocketIO from "./socketIoHandler.js"; // The SocketIO stuff
import express from "express";

const path = env("SOCKET_PATH", false);
const port = env("PORT", !path && "3000");

const app = express();
const server = http.createServer(app);

// Inject SocketIO
injectSocketIO(server);

// SvelteKit handlers
app.use(handler);

server.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
