import { get } from "svelte/store";
import { access_token, refresh_token } from "$lib/stores.js";

export function get_access_token() {
  return get(access_token);
}

export function set_access_token(value: string) {
  access_token.set(value);
}

export function reset_access_token() {
  access_token.reset();
}

export function get_refresh_token() {
  return get(refresh_token);
}

export function set_refresh_token(value: string) {
  refresh_token.set(value);
}

export function reset_refresh_token() {
  refresh_token.reset();
}
