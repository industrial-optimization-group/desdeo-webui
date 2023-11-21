import type { Backend, Problem } from "$lib/api";
import * as requests from "../reference_point_method/requests";

export type Method = Uninitialized | Initialized | Iterated;
export type CanIterate = Initialized | Iterated;

export type Uninitialized = {
  _tag: "Uninitialized";
  backend: Backend;
  problem: Problem;
};

export type Initialized = {
  _tag: "Initialized";
  backend: Backend;
  problem: Problem;
  message: string;
  ideal_point: number[];
  nadir_point: number[];
};

export type Iterated = {
  _tag: "Iterated";
  backend: Backend;
  problem: Problem;
  message: string;
  current_iteration_point: number[];
  lower_bounds: number[];
  upper_bounds: number[];
  distance: number[];
};

export function nautilus_method(
  backend: Backend,
  problem: Problem
): Uninitialized {
  return {
    _tag: "Uninitialized",
    backend,
    problem,
  };
}

/**
 * @throws Rejects with `AxiosError` with `response.status` set to `406` if the
 *   initialization failed for example because the problem is unsupported by the
 *   method.
 */
export async function initialize(method: Method): Promise<Initialized> {
  await requests.setup_nautilus(method.backend, method.problem);

  const { response } = await requests.startNew(method.backend, method.problem);
  console.log("initialize", response);

  return {
    _tag: "Initialized",
    backend: method.backend,
    problem: method.problem,
    message: response.message,
    ideal_point: response.ideal,
    nadir_point: response.nadir,
  };
}

export async function iterate(
  method: CanIterate,
  n_iterations?: number,
  short_step?: boolean,
  step_back?: boolean,
  use_previous_preference?: boolean,
  preference_method?: number,
  preference_info?: number[]
): Promise<Iterated> {
  const { response } = await requests.iterateNautilus(
    method.backend,
    method.problem,
    n_iterations,
    preference_method,
    preference_info,
    (use_previous_preference = undefined),
    (step_back = undefined),
    (short_step = undefined)
  );

  return {
    _tag: "Iterated",
    backend: method.backend,
    problem: method.problem,
    current_iteration_point: response.current_iteration_point,
    distance: response.distance,
    lower_bounds: response.lower_bounds,
    message: response.message,
    upper_bounds: response.upper_bounds,
  };
}

export function can_iterate(method: Method): method is CanIterate {
  return is_initialized(method) || is_iterated(method);
}

export function is_uninitialized(method: Method): method is Uninitialized {
  return method._tag === "Uninitialized";
}

export function is_initialized(method: Method): method is Initialized {
  return method._tag === "Initialized";
}

export function is_iterated(method: Method): method is Iterated {
  return method._tag === "Iterated";
}
