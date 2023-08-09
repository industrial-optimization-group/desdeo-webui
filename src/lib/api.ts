import axios from "axios";
import { z } from "zod";
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

/** The current login status. */
// export const logged_in = derived(state.refresh_token, ($refresh_token) => {
//   return $refresh_token !== undefined;
// });

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

/** Problem data in the format provided by the backend */
type _Problem = {
  problem_id: number;
  problem_name: string;
  problem_type: string;
  objective_names: string[];
  minimize: number[];
  n_objectives: number;
  variable_names: string[];
  n_variables: number;
  n_constraints: number;
};

/** Problem data in the format used by the frontend */
export type Problem = {
  id: number;
  name: string;
  type: string;
  objectives: Objective[];
  n_objectives: number;
  variables: Variable[];
  n_variables: number;
  n_constraints: number;

  //
  // Having the numbers of objectives, variables and constraints as properties
  // of the problem is useful in the frontend.
  //
};

export type Objective = {
  name: string;
  minimize: boolean;
};

export type ObjectivePreference = {
  name: string;
  minimize: boolean;

  min: number /** Minimum value */;
  max: number /** Maximum value */;
  preference?: number;
};

export type Variable = {
  name: string;
};

/** Transforms problem data from the backend format to the frontend format */
function transform_problem(problem: _Problem): Problem {
  const objectives = extract_objectives(problem);
  const variables = extract_variables(problem);

  return {
    id: problem.problem_id,
    name: problem.problem_name,
    type: problem.problem_type,
    objectives: objectives,
    n_objectives: objectives.length,
    variables: variables,
    n_variables: variables.length,
    n_constraints: problem.n_constraints,
  };
}

function extract_objectives(problem: _Problem): Objective[] {
  return problem.objective_names.map((name, i) => ({
    name,
    minimize: problem.minimize[i] === 1,
  }));
}

function extract_variables(problem: _Problem): Variable[] {
  return problem.variable_names.map((name) => ({
    name,
  }));
}

// TODO: Currently requires a batched version of the backend
export function get_all_problems(): Promise<Problem[]> {
  return with_access_token()
    .get("/problem/access/all")
    .then((response) => {
      // TODO: Validate data
      return (<_Problem[]>response.data).map(transform_problem);
    });
}

export function get_problem(problem_id: number): Promise<Problem> {
  return with_access_token()
    .post("/problem/access", { problem_id })
    .then((response) => {
      // TODO: Validate data
      return transform_problem(response.data);
    });
}

/**
 * Method control
 *
 * The following section contains functions to control the solution methods.
 */

const Point = z.array(z.number().finite());

/** Response to the "start method" request */
const StartMethod = z.object({
  response: z.object({
    ideal: Point,
    nadir: Point,
    message: z.string(),
  }),
});

type StartMethod = z.infer<typeof StartMethod>;

/**
 * Creates a refinement of the `StartMethod` schema with the point length
 * restricted to `n`.
 */
function startMethod(n: number) {
  return z.object({
    response: z.object({
      ideal: Point.length(n),
      nadir: Point.length(n),
      message: z.string(),
    }),
  });
}

/**
 * Starts a solution method that has previously been set up with a POST request
 * to `/method/create`. The `n_objectives` parameter is used to validate that
 * the ideal and nadir points in the response have correct lengths. The points
 * are also validated to only contain finite values.
 *
 * @param n_objectives The number of objectives.
 */
async function start_method(n_objectives: number): Promise<StartMethod> {
  const response = await with_access_token().get("/method/control");
  return startMethod(n_objectives).parse(response.data);
}

/**
 * Initializes or restarts the reference point method. The objectives in the
 * returned list have their `min` and `max` properties set based on the ideal
 * and nadir points the server returns in response to the "start method"
 * request. The `min` and `max` properties are also validated to be finite.
 *
 * @param problem The problem to solve.
 * @returns The objectives with their boundaries filled in.
 */
export async function initialize_reference_point_method(
  problem: Problem
): Promise<ObjectivePreference[]> {
  await with_access_token().post("/method/create", {
    problem_id: problem.id,
    method: "reference_point_method",
  });
  const data = await start_method(problem.n_objectives);
  const ideal = data.response.ideal;
  const nadir = data.response.nadir;

  return problem.objectives.map((objective, index) => ({
    ...objective,
    min: Math.min(ideal[index], nadir[index]),
    max: Math.max(ideal[index], nadir[index]),
  }));
}

export function iterate_reference_point_method(reference_point: number[]) {
  return with_access_token().post("/method/control", {
    response: {
      reference_point,
    },
  });
}
