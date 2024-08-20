import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
import adapter_node from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  // See https://kit.svelte.dev/docs/integrations#preprocessors
  preprocess: [
    vitePreprocess(),
    preprocess({
      postcss: true,
    }),
  ],
  kit: {
    // See https://kit.svelte.dev/docs/adapters
    adapter: adapter(),
  },
};

if (process.env.NPM_RUN == "start:production") {
  config.kit.adapter = adapter_node();
}

export default config;
