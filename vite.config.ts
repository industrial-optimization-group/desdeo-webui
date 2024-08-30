import { sveltekit } from "@sveltejs/kit/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vitest/config";
import { webSocketServer } from "./webSocket.js";

// If you get "Plugin_2 is not assignable to PluginOption"
// try deleting node_modules and reinstalling
// In my case, installing with npm worked. Installing with yarn gave me the error.
export default defineConfig({
  preview: {
    port: 3000,
  },
  plugins: [
    sveltekit(),
    Icons({
      compiler: "svelte",
    }),
    webSocketServer,
  ],
  resolve: {
    alias: {
      "xmlhttprequest-ssl":
        "./node_modules/engine.io-client/lib/xmlhttprequest.js",
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
