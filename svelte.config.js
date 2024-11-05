import preprocess from "svelte-preprocess";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  preprocess: [
    vitePreprocess(),
    preprocess({
      postcss: true,
    }),
  ],
  kit: {
    // We'll dynamically set the adapter below
  },
};

async function setAdapter() {
  if (process.env.NPM_RUN == "start:production") {
    const { default: adapterNode } = await import("@sveltejs/adapter-node");
    config.kit.adapter = adapterNode();
  } else {
    const { default: adapterStatic } = await import("@sveltejs/adapter-static");
    config.kit.adapter = adapterStatic();
  }
}

await setAdapter();

export default config;
