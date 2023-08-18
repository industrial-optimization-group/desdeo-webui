import type {
  Backend,
  UnboundedProblem,
  BoundedProblem,
  Point,
  BoundedObjective,
} from "$lib/api";

import * as requests from "./requests";

export type Method = {
  backend: Backend;
  state: State;
};

//
// NOTE: The backend instructs to set `satisfied` to `false` after the first
// iteration, but it seems this is not actually needed. It is not set by the
// old frontend, which according to Giovanni works correctly. If we later
// decide to handle the later iterations differently, a new `IteratedOnce`
// state should be added between `Initialized` and `Iterated`.
//

type State = Uninitialized | Initialized | Iterated;

type Uninitialized = {
  _tag: "Uninitialized";
  problem: UnboundedProblem;
};

type Initialized = {
  _tag: "Initialized";
  problem: BoundedProblem;
};

type Iterated = {
  _tag: "Iterated";
  problem: BoundedProblem;
  previous_preference: Point;
  current_solution: Point;
  additional_solutions: Point[];
};

/** Creates a new `Method` instance in the `Uninitialized` state. */
export function reference_point_method(
  backend: Backend,
  problem: UnboundedProblem
): Method {
  return {
    backend,
    state: {
      _tag: "Uninitialized",
      problem,
    },
  };
}

export async function initialize(method: Method): Promise<Method> {
  // "Initialize" can be called in any state.
  await requests.setup(method.backend, method.state.problem);
  const data = await requests.start(method.backend, method.state.problem);
  const bounded_objectives: BoundedObjective[] =
    method.state.problem.objectives.map((objective, j) => ({
      ...objective,
      min: Math.min(data.response.ideal[j], data.response.nadir[j]),
      max: Math.max(data.response.ideal[j], data.response.nadir[j]),
    }));
  return {
    ...method,
    state: {
      _tag: "Initialized",
      problem: {
        ...method.state.problem,
        objectives: bounded_objectives,
      },
    },
  };
}

export async function iterate(
  method: Method,
  reference_point: Point
): Promise<Method> {
  if (method.state._tag === "Uninitialized") {
    throw new Error("Can't iterate in current state");
  }
  const data = await requests.iterate(
    method.backend,
    method.state.problem,
    reference_point
  );
  return {
    ...method,
    state: {
      ...method.state,
      _tag: "Iterated",
      previous_preference: reference_point,
      current_solution: data.response.current_solution,
      additional_solutions: data.response.additional_solutions,
    },
  };
}

export function is_uninitialized(method: Method): boolean {
  return method.state._tag === "Uninitialized";
}

export function is_initialized(method: Method): boolean {
  return method.state._tag === "Initialized";
}

export function has_iterated(method: Method): boolean {
  return method.state._tag === "Iterated";
}
