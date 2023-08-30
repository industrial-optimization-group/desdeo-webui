import type { Backend, Problem, Point } from "$lib/api";
import * as requests from "./requests";

//
// NOTE: The backend instructs to set `satisfied` to `false` after the first
// iteration, but it seems this is not actually needed. It is not set by the
// old frontend, which according to Giovanni works correctly. If we later
// decide to handle the later iterations differently, a new `IteratedOnce`
// state should be added between `Initialized` and `Iterated`.
//

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
  ideal_point: Point;
  nadir_point: Point;
};

export type Iterated = {
  _tag: "Iterated";
  backend: Backend;
  problem: Problem;
  message: string;
  ideal_point: Point;
  nadir_point: Point;
  previous_preference: Point;
  current_solution: Point;
  additional_solutions: Point[];
};

/** Creates a new `Method` instance in the `Uninitialized` state. */
export function reference_point_method(
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
  await requests.setup(method.backend, method.problem);
  const { response } = await requests.start(method.backend, method.problem);
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
  reference_point: Point
): Promise<Iterated> {
  const { response } = await requests.iterate(
    method.backend,
    method.problem,
    reference_point
  );
  return {
    _tag: "Iterated",
    backend: method.backend,
    problem: method.problem,
    message: response.message,
    ideal_point: method.ideal_point,
    nadir_point: method.nadir_point,
    previous_preference: reference_point,
    current_solution: response.current_solution,
    additional_solutions: response.additional_solutions,
  };
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

export function can_iterate(method: Method): method is CanIterate {
  return is_initialized(method) || is_iterated(method);
}

export function is_valid_reference_point(
  method: Method,
  value: unknown
): value is Point {
  return requests.is_valid_reference_point(method.problem, value);
}

export function objective_names(method: Method): string[] {
  return method.problem.objectives.map(({ name }) => name);
}

/** Returns the objective names with ` (min)` or ` (max)` appended. */
export function objective_names_with_goals(method: Method): string[] {
  return method.problem.objectives.map(
    (objective) => `${objective.name} (${objective.minimize ? "min" : "max"})`
  );
}

export function lower_bounds(method: CanIterate): Point {
  return method.ideal_point.map((ideal_value, j) =>
    Math.min(ideal_value, method.nadir_point[j])
  );
}

export function upper_bounds(method: CanIterate): Point {
  return method.ideal_point.map((ideal_value, j) =>
    Math.max(ideal_value, method.nadir_point[j])
  );
}

/** Returns all solutions, with the current solution as the first one. */
export function all_solutions(method: Iterated): Point[] {
  return [method.current_solution, ...method.additional_solutions];
}
