import { derived, writable } from "svelte/store";
import { token_store } from "$lib/token_store.js";

export const access_token = token_store();
export const refresh_token = token_store();
export const username = writable<string>();

export const logged_in = derived(refresh_token, ($refresh_token) => {
  return typeof $refresh_token !== "undefined";
});
