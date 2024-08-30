import type { Socket } from "socket.io-client";
import type { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";

let server: HttpServer | null = null;
let instance: Socket | SocketIOServer | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let config: { host: URL | null; options: Record<string, any> } | null = null;

export function getConfig(): {
  host: URL | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Record<string, any>;
} | null {
  return config ? { ...config } : null;
}

export function started(): boolean {
  return !!instance;
}

export async function setup(
  host: string | number | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Record<string, any> = {}
): Promise<Socket | SocketIOServer> {
  if (started()) {
    await close();
  }

  if (typeof host === "number") {
    host = `http://0.0.0.0:${host}`;
  }

  config = {
    host: host ? new URL(host) : null,
    options: { ...options },
  };

  if (typeof window !== "undefined") {
    const client = (await import("socket.io-client")).default;
    return (instance = client(config.host ? config.host.href : ""));
  }

  const { createServer } = await import("http");
  const { Server } = await import("socket.io");

  server = createServer();
  instance = new Server(server, config.options);

  return new Promise<SocketIOServer>((resolve) => {
    server?.listen(
      Number(config?.host?.port || 3000),
      config?.host?.hostname || "localhost",
      () => {
        resolve(instance as SocketIOServer);
      }
    );
  });
}

export function get(): Socket | SocketIOServer | null {
  return instance;
}

export function close(): void {
  if (!instance) {
    return;
  }

  if (server) {
    server.close();
    server = null;
  }

  instance = null;
}

export default {
  getConfig,
  started,
  setup,
  get,
  close,
};
