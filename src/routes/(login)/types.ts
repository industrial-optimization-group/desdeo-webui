import type { Writable } from "svelte/store";

export type LoginContext = {
  username: Writable<string>;
  password: Writable<string>;
};
