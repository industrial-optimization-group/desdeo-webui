import axios from "axios";
import { derived, writable, get, readonly } from "svelte/store";

// The API URL
const baseURL = "http://localhost:5000";

/** A missing token is represented by `undefined`. */
type Token = string | undefined;

//
// The state is stored in Svelte stores because these are readily
// available and have useful features. We provide functions to
// read and write the state to hide the implementation details from
// the rest of the module. The intention is to make it easy to replace
// the implementation.
//
const state = {
  access_token: writable<Token>(undefined),
  refresh_token: writable<Token>(undefined),
  username: writable<string | undefined>(undefined),
};

function set_access_token(token: Token) {
  if (token === "") {
    throw new Error("Invalid token (empty string)");
  }
  state.access_token.set(token);
}

function get_access_token() {
  return get(state.access_token);
}

function set_refresh_token(token: Token) {
  if (token === "") {
    throw new Error("Invalid token (empty string)");
  }
  state.refresh_token.set(token);
}

function get_refresh_token() {
  return get(state.refresh_token);
}

function set_username(username: string | undefined) {
  if (username === "") {
    throw new Error("Invalid username (empty string)");
  }
  state.username.set(username);
}

// function get_username() {
//   return get(state.username);
// }

/** The current login status. */
export const logged_in = derived(state.refresh_token, ($refresh_token) => {
  return $refresh_token !== undefined;
});

/** The current username. */
export const username = readonly(state.username);

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
      // Ideally the server would return the username, but we'll use
      // the submitted username as a replacement. (It's not good
      // to parse the username from the message because the message
      // could change.)
      //
      set_username(username);

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
