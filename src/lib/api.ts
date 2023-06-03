import axios from "axios";
import { derived, writable, get } from "svelte/store";
import { username as username_store } from "$lib/stores.js";

// The API URL
const baseURL = "http://localhost:5000";

/** A missing token is represented by `undefined`. */
type Token = string | undefined;

//
// The tokens are saved in Svelte stores because these are readily
// available and have useful features. We provide functions to
// set and get the tokens to hide the implementation details from
// the rest of the module. The intention is to make it easy to replace
// the implementation.
//
const access_token = writable<Token>(undefined);
const refresh_token = writable<Token>(undefined);

function set_access_token(token: Token) {
  if (token === "") {
    throw new Error("Invalid token");
  }
  access_token.set(token);
}

function get_access_token() {
  return get(access_token);
}

function set_refresh_token(token: Token) {
  if (token === "") {
    throw new Error("Invalid token");
  }
  refresh_token.set(token);
}

function get_refresh_token() {
  return get(refresh_token);
}

/** Represents the current login status. */
export const logged_in = derived(refresh_token, ($refresh_token) => {
  return $refresh_token !== undefined;
});

function without_token() {
  return axios.create({ baseURL });
}

function with_access_token() {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${get_access_token()}`,
    },
  });
}

// TODO: Authorization error should also invalidate the access token
// if it exists?
function with_refresh_token() {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${get_refresh_token()}`,
    },
  });
}

/**
 * Attempts to log in with the given credentials.
 *
 * If the login is successful, overwrites the current values of the access
 * token, the refresh token and the username. The caller is responsible for
 * invalidating the old tokens before calling this function.
 *
 * @returns The message returned by the server.
 */
export function login(username: string, password: string) {
  return without_token()
    .post("/login", {
      username,
      password,
    })
    .then((response) => {
      set_access_token(response.data.access_token);
      set_refresh_token(response.data.refresh_token);

      //
      // Ideally the server would return the username,
      // but we'll use the submitted username as a replacement.
      // (We don't parse the username from the message
      // because the message could change.)
      //
      username_store.set(username);

      return {
        message: <string>response.data.message,
      };
    });
}

function invalidate_access_token() {
  return with_access_token()
    .post("/logout/access")
    .then(() => {
      set_access_token(undefined);
      return Promise.resolve();
    });
}

function invalidate_refresh_token() {
  return with_refresh_token()
    .post("/logout/refresh")
    .then(() => {
      set_refresh_token(undefined);
      return Promise.resolve();
    });
}

export function refresh_access_token() {
  return with_refresh_token()
    .post("/token/refresh")
    .then((response) => {
      set_access_token(response.data.access_token);
      return Promise.resolve();
    });
}

export function logout() {
  return invalidate_refresh_token().then(() => {
    return invalidate_access_token();
  });
}
