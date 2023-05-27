import { writable, type Writable } from "svelte/store";

export interface TokenStore extends Writable<string> {
  reset(this: void): void;
}

export function token_store(): TokenStore {
  let { set, update, subscribe } = writable<string>();
  function reset() {
    ({ set, update, subscribe } = writable<string>());
  }
  return { set, update, reset, subscribe };
}
