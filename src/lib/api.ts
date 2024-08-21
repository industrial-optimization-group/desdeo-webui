//
// TODO: Rename this module to `backend_client.ts`?
//
// TODO: Some response data isn't currently validated.
//

import axios, { type AxiosInstance } from "axios";
import { z } from "zod";

//
// TODO: Replace anything that depends on Svelte with something else to make
// the module reusable elsewhere. Currently only the state uses Svelte stores.
// These stores could be replaced with RxJS observables.
//
import { derived, get, readonly, writable } from "svelte/store";

import { PUBLIC_DESDEO_API_SERVER } from '$env/dynamic/public';

/** An interface for accessing a backend server. */
export interface Backend {
  with_instance: () => AxiosInstance;
}

//
// Export this module as a backend instance.
//
// TODO: It would be nice to have a function that creates new backend
// instances.
//
export const backend: Backend = {
  with_instance: with_access_token,
};

type OAuth2Response = {
  access_token: string;
  token_type: string;
};
//
// The backend URL
//
// TODO: Move this to a configuration file.
//

export const baseURL = PUBLIC_DESDEO_API_SERVER || "http://localhost:8000";

/** A missing token is represented by `undefined`. */
export type Token = string | undefined;

//
// The state is stored in Svelte stores because these are readily
// available and have useful features. We provide functions to
// read and write the state to hide the implementation details from
// the rest of the module. The intention is to make it easy to replace
// the implementation.
//
const state = {
  access_token: writable<Token>(undefined),

  /** A refresh token that is not `undefined` represents the state `logged in`. */
  refresh_token: writable<Token>(undefined),

  /**
   * Username must be `undefined` if the state is `logged out`. When `logged
   * in`, anything other than `undefined` represents `logged in as a user` and
   * must be the logged in user's actual username. When `logged in`, `undefined`
   * username represents `logged in as a guest`.
   */
  username: writable<string | undefined>(undefined),
};

function set_access_token(token: Token) {
  state.access_token.set(token);
}

// Get the access token. If the token is `undefined`, the state is `logged out`.
export function get_access_token() {
  return get(state.access_token);
}

function set_refresh_token(token: Token) {
  state.refresh_token.set(token);
}

function get_refresh_token() {
  return get(state.refresh_token);
}

function set_username(username: string | undefined) {
  state.username.set(username);
}

//
// TODO: It would be better to use a tagged union with the user name included
// in the status.
//
export enum LoginStatus {
  LoggedOut = "LOGGED_OUT",
  LoggedInAsUser = "LOGGED_IN_AS_USER",
  LoggedInAsGuest = "LOGGED_IN_AS_GUEST",
}

/** See {@link state} for how the login status is determined. */
export const login_status = derived(
  [state.access_token, state.username],
  ([$access_token, $username]) => {
    if ($access_token === undefined) {
      return LoginStatus.LoggedOut;
    }
    if ($username === undefined) {
      return LoginStatus.LoggedInAsGuest;
    }
    return LoginStatus.LoggedInAsUser;
  }
);

/** The logged in user's username. */
export const username = readonly(state.username);

//
// End of state-related section
//

function without_token() {
  return axios.create({ baseURL });
}

// TODO: Add middleware for token renewal on authorization error.
function with_access_token() {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${get_access_token()}`,
    },
  });
}

//
// TODO: Should authorization error also invalidate the access token
// if it exists?
//
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
 * @returns The message returned by the backend server. The tokens are not
 *   included.
 *
 *   TODO: Validate response data.
 */
export function login(
  username: string,
  password: string
): Promise<{ message: string }> {
  return without_token()
    .post("/token", {
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

/** Attempts to log in with the given invitation code. */

export async function loginWithInvite(
    code: string
): Promise<{ message: string }> {
  try {
    return await without_token()
        .post("/login-with-invite", {
          code,
        })
        .then((response) => {
          set_access_token(response.data.access_token);
          set_refresh_token(response.data.refresh_token);
          set_username(response.data.username);
          return {
            message: <string>response.data.message,
          };
        });
  } catch (e) {
    console.log(e);
    return {
      message: "Failed to log in",
    };
  }
}

export async function loginOAuth2(
  username: string,
  password: string
): Promise<{ message: string }> {
  // Note that the backend does not send a refresh token. The access token currently expires after 2 hours.
  try {
    const response = await fetch(baseURL + "/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: username,
        password: password,
        grant_type: "password",
      }),
    });
    if (response.ok) {
      const data: OAuth2Response = await response.json();
      set_access_token(data.access_token);
      set_username(username);
      return {
        message: "Logged in successfully",
      };
    } else {
      return {
        message: "Failed to log in",
      };
    }
  } catch (e) {
    console.log(e);
    return {
      message: "Failed to log in",
    };
  }
}

/**
 * Attempts to log in as a guest user.
 *
 * @returns The message returned by the backend server. The tokens are not
 *   included.
 *
 *   TODO: Validate response data.
 */
export function login_as_guest(): Promise<{ message: string }> {
  return without_token()
    .get("/guest/create")
    .then((response) => {
      set_access_token(response.data.access_token);
      set_refresh_token(response.data.refresh_token);
      set_username(undefined);
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
 */
export async function logout(ignore_errors = true): Promise<void> {
  //
  // The refresh token is invalidated first because it can be used to get a new
  // access token.
  //
  await invalidate_refresh_token(ignore_errors);
  await invalidate_access_token(ignore_errors);
  set_username(undefined);
}

/**
 * Invalidates the access token and clears it from the state.
 *
 * See {@link logout} for comments about possible failure.
 *
 * If `ignore_errors` is `true` (default), ignores all errors silently and
 * clears the token. If `ignore_errors` is `false`, a possible error is
 * propagated to the caller and the token is not cleared.
 *
 * Does nothing if an access token doesn't exist.
 *
 * TODO: Validate response data.
 */
async function invalidate_access_token(ignore_errors = true): Promise<void> {
  if (get_access_token() === undefined) {
    return;
  }
  try {
    await with_access_token().post("/logout/access");
    //
  } catch (err) {
    if (!ignore_errors) {
      throw err;
    }
  }
  set_access_token(undefined);
}

/**
 * Invalidates the refresh token and clears it from the state.
 *
 * See {@link logout} for comments about possible failure.
 *
 * If `ignore_errors` is `true` (default), ignores all errors silently and
 * clears the token. If `ignore_errors` is `false`, a possible error is
 * propagated to the caller and the token is not cleared.
 *
 * Does nothing if a refresh token doesn't exist.
 *
 * TODO: Validate response data.
 */
async function invalidate_refresh_token(ignore_errors = true): Promise<void> {
  if (get_refresh_token() === undefined) {
    return;
  }
  try {
    await with_refresh_token().post("/logout/refresh");
    //
  } catch (err) {
    if (!ignore_errors) {
      throw err;
    }
  }
  set_refresh_token(undefined);
}

/**
 * Attempts to renew the access token.
 *
 * TODO: Validate response data.
 *
 * TODO: Rename to `renew_access_token`?
 */
export function refresh_access_token(): Promise<void> {
  return with_refresh_token()
    .post("/token/refresh")
    .then((response) => {
      set_access_token(response.data.access_token);
    });
}

/**
 * Register a new user account and log in.
 *
 * Note that currently the server doesn't validate the username or password in
 * any way. This means that the empty string and strings containing whitespace
 * are accepted as usernames and passwords by the server.
 *
 * The new user account is automatically logged in by the server.
 *
 * @returns The message returned by the backend server. The tokens are not
 *   included.
 */
export function register_account(
  username: string,
  password: string
): Promise<{ message: string }> {
  return without_token()
    .post("/registration", {
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

//
// NOTE: Requires a version of the backend that sends the problems as a list
// rather than a record. This format is easier to handle and more useful in
// general.
//
export async function get_all_problems(): Promise<Problem[]> {
  const response = await with_access_token().get("/problem/access/all");
  const problems = z.array(BackendProblemS).parse(response.data);
  return problems.map(transform_problem);
}

export async function get_problem(problem_id: number): Promise<Problem> {
  const response = await with_access_token().post("/problem/access", {
    problem_id,
  });
  const problem = BackendProblemS.parse(response.data);
  return transform_problem(problem);
}

//
// Schemas and types
//
// TODO: Rename the `PointS` schema to `FinitePointS` and add a new `PointS`
// schema that allows infinite values?
//

export const PointS = z.array(z.number().finite());
export type Point = z.infer<typeof PointS>;

/**
 * Problem data in the format provided by the backend.
 *
 * NOTE: Requires a version of the backend that sends infinite values as the
 * strings "+Infinity" and "-Infinity". This change was required because the
 * backend was sending invalid JSON that caused the JSON parser to fail.
 *
 * TODO: Validate that all the lengths match.
 */
const BackendProblemS = z
  .object({
    problem_id: z.number(),
    problem_name: z.string(),
    problem_type: z.string(),
    objective_names: z.array(z.string()),
    minimize: z.array(
      z.union([
        z.literal(1).transform(() => true),
        z.literal(-1).transform(() => false),
      ])
    ),
    n_objectives: z.number(),
    variable_names: z.array(z.string()),
    n_variables: z.number(),
    n_constraints: z.number(),
    ideal: z.array(
      z.union([
        z.number().finite(),
        z.literal("+Infinity").transform(() => +Infinity),
        z.literal("-Infinity").transform(() => -Infinity),
      ])
    ),
    nadir: z.array(
      z.union([
        z.number().finite(),
        z.literal("+Infinity").transform(() => +Infinity),
        z.literal("-Infinity").transform(() => -Infinity),
      ])
    ),
  })
  .strict();

type BackendProblem = z.infer<typeof BackendProblemS>;

/**
 * Problem data in the format used by the frontend.
 *
 * @property type - It is unclear what this field represents. It is included in
 *   the type because the backend makes it available.
 */
export type Problem = {
  id: number;
  name: string;
  type: string;
  objectives: Objective[];
  variables: Variable[];
  n_constraints: number;
  ideal_point: number[];
  nadir_point: number[];
};

/**
 * @property minimize - `true` if the goal is to minimize, `false` if the goal
 *   is to maximize.
 */
export type Objective = {
  name: string;
  minimize: boolean;
};

export type Variable = {
  name: string;
};

//
// Utility functions
//

/** Transforms problem data from the backend format to the frontend format. */
function transform_problem(problem: BackendProblem): Problem {
  return {
    id: problem.problem_id,
    name: problem.problem_name,
    type: problem.problem_type,
    objectives: problem.objective_names.map((name, j) => ({
      name,
      minimize: problem.minimize[j],
    })),
    variables: problem.variable_names.map((name) => ({ name })),
    n_constraints: problem.n_constraints,
    ideal_point: problem.ideal,
    nadir_point: problem.nadir,
  };
}

/**
 * Checks whether `value` is a finite point in the sense that it is an (possibly
 * empty) array of finite numbers.
 */
export function is_point(value: unknown): value is Point {
  return PointS.safeParse(value).success;
}

/**
 * Checks whether `value` is a finite point of length `n` in the sense that it
 * is an array of length `n` of finite numbers.
 */
export function is_point_of_length(value: unknown, n: number): value is Point {
  return PointS.length(n).safeParse(value).success;
}

/**
 * Checks whether the ideal and nadir points of the problem contain only finite
 * values.
 */
export function problem_has_finite_bounds(problem: Problem) {
  return is_point(problem.ideal_point) && is_point(problem.nadir_point);
}

export const methodHeaderText = writable("No method selected yet");
export const selectedProblem = writable(-1);
export const selectedMethod = writable("");
