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

//
// End of state-related section
//

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

/**
 * Invalidates and clears the tokens and clears the username.
 *
 * Attempts to invalidate the access and refresh tokens and clears them and the
 * username from the state. Note that the invalidation could fail, for example
 * because the server is unreachable.
 *
 * If `ignore_errors` is `true` (default), ignores all errors silently and
 * clears the tokens and username anyway. Note that this makes it impossible to
 * reattempt the invalidation later. If `ignore_errors` is `false`, a possible
 * error is propagated to the caller and only the (possibly) successfully
 * invalidated token is cleared.
 *
 * Does effectively nothing if not logged in.
 *
 * @param ignore_errors
 */
export async function logout(ignore_errors = true) {
  //
  // We're invalidating the tokens sequentially rather than in parallel so that
  // possible error situations can be handled correctlu. The refresh token is
  // invalidated first because it can be used to get a new access token.
  //
  await invalidate_refresh_token(ignore_errors);
  await invalidate_access_token(ignore_errors);

  set_username(undefined);
}

/**
 * Invalidates the current access token and clears it from the state.
 *
 * See {@link logout} for comments about possible failure.
 *
 * If `ignore_errors` is `true` (default), ignores all errors silently and
 * clears the token. If `ignore_errors` is `false`, a possible error is
 * propagated to the caller and the token is not cleared.
 *
 * Does nothing if an access token doesn't exist.
 *
 * @param ignore_errors
 */
async function invalidate_access_token(ignore_errors = true) {
  if (get_access_token() === undefined) {
    return;
  }
  try {
    await with_access_token().post("/logout/access");
  } catch (error) {
    if (!ignore_errors) {
      throw error;
    }
  }
  set_access_token(undefined);
}

/**
 * Invalidates the current refresh token and clears it from the state.
 *
 * See {@link logout} for comments about possible failure.
 *
 * If `ignore_errors` is `true` (default), ignores all errors silently and
 * clears the token. If `ignore_errors` is `false`, a possible error is
 * propagated to the caller and the token is not cleared.
 *
 * Does nothing if a refresh token doesn't exist.
 *
 * @param ignore_errors
 */
async function invalidate_refresh_token(ignore_errors = true) {
  if (get_refresh_token() === undefined) {
    return;
  }
  try {
    await with_refresh_token().post("/logout/refresh");
  } catch (error) {
    if (!ignore_errors) {
      throw error;
    }
  }
  set_refresh_token(undefined);
}

export function refresh_access_token() {
  return with_refresh_token()
    .post("/token/refresh")
    .then((response) => {
      set_access_token(response.data.access_token);
    });
}
