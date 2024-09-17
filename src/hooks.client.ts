import skio from "$lib/socket.js";
import type { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io-client";

import { refreshToken, get_access_token } from "$lib/api";
import axios from "axios";

const { fetch: originalFetch } = window;
window.fetch = async (resource, config = {}, retries = 1) => {
  const response = await originalFetch(resource, config);
  if (!response.ok && response.status === 401) {
    if (retries > 0) {
      await refreshToken(response);
      return await fetch(
        resource,
        {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${get_access_token()}`,
          },
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        retries - 1
      );
    }
    return Promise.reject(response);
  }
  return response;
};

axios.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (error.response?.status === 401 && !error.config?._retry) {
      await refreshToken(error);
      if (get_access_token()) {
        error.config._retry = true;
        error.config.headers["Authorization"] = `Bearer ${get_access_token()}`;
        return axios(error.config);
      }
    }
    return error;
  }
);

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
    .then((socket: Socket | SocketIOServer) => {
      (socket as Socket).on("connect", () => {
        if (socket) {
          socket.on("message", (message) => {
            console.log(message);
          });
        }
      });
    });
}
