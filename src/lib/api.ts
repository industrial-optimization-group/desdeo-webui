import axios, { type AxiosInstance } from "axios";
import { z } from "zod";
import { derived, writable, get, readonly } from "svelte/store";

/** An interface for accessing a backend server. */
export interface Backend {
  with_instance: () => AxiosInstance;
}

export const backend: Backend = {
  with_instance: with_access_token,
};

//
// The backend URL
//
// TODO: Move this to a configuration file.
//
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

export enum LoginStatus {
  LoggedOut = "LOGGED_OUT",
  LoggedInAsUser = "LOGGED_IN_AS_USER",
  LoggedInAsGuest = "LOGGED_IN_AS_GUEST",
}

/** See {@link state} for how the login status is determined. */
export const login_status = derived(
  [state.refresh_token, state.username],
  ([$refresh_token, $username]) => {
    if ($refresh_token === undefined) {
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

function with_access_token() {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${get_access_token()}`,
    },
  });
}

//
// TODO: Authorization error should also invalidate the access token
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
 * @returns The message returned by the server. The tokens are not included to
 *   prevent leaking.
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
 * Attempts to log in as a guest user.
 *
 * @returns The message returned by the server.
 */
export function login_as_guest() {
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
 *
 * @param ignore_errors
 */
export async function logout(ignore_errors = true) {
  //
  // We're invalidating the tokens sequentially rather than concurrently so that
  // possible error situations can be handled correctly. The refresh token is
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

/**
 * Register a new user account and log in.
 *
 * Note that currently the server doesn't validate the username or password in
 * any way. This means that the empty string and strings containing whitespace
 * are accepted as usernames and passwords by the server.
 *
 * The new user account is automatically logged in by the server.
 *
 * @returns The message returned by the server.
 */
export function register_account(username: string, password: string) {
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
// NOTE: Requires a version of the backend that doesn't send ideal and nadir
// points as part of the problem data. See `BackendProblemS` for more
// information.
//
export async function get_all_problems(): Promise<Problem[]> {
  const response = await with_access_token().get("/problem/access/all");
  const problems = z.array(BackendProblemS).parse(response.data);
  return problems.map(transform_problem);
}

//
// NOTE: Requires a version of the backend that doesn't send ideal and nadir
// points as part of the problem data. See `BackendProblemS` for more
// information.
//
// TODO: Is this function used anywhere? Does this access point actually send
// the data in the `BackendProblem` format?
//
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

export const PointS = z.array(z.number().finite());
export type Point = z.infer<typeof PointS>;

/**
 * Problem data in the format provided by the backend.
 *
 * NOTE: Does not include ideal and nadir points. I needed to remove these from
 * the backend as a quick fix, because infinite values were sent as invalid JSON
 * that caused the JSON parser to throw an error.
 *
 * A possible short-term solution might be to only include the ideal and nadir
 * points in the response when they are finite. A long-term solution could be to
 * handle non-numeric values in the same way as MathJSON does.
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
