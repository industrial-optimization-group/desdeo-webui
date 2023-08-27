import type { Backend, Problem, Point } from "$lib/api";
import { z } from "zod";
import { PointS, is_point_of_length } from "$lib/api";

/**
 * Sets up the method with the problem.
 *
 * @throws Rejects with `AxiosError` with `response.status` set to `406` if the
 *   setup failed for example because the problem is unsupported by the method.
 */
export async function setup(backend: Backend, problem: Problem): Promise<void> {
  await backend.with_instance().post("/method/create", {
    problem_id: problem.id,
    method: "reference_point_method",
  });
}

/**
 * Starts the method.
 *
 * - The caller is responsible for calling `setup` before starting.
 */
export async function start(
  backend: Backend,
  problem: Problem
): Promise<StartResponse> {
  const response = await backend.with_instance().get("/method/control");
  return startResponseS(problem.objectives.length).parse(response.data);
}

/**
 * Runs one iteration of the method.
 *
 * - The caller is responsible for calling `start` before the first iteration.
 * - The caller is responsible for verifying that the reference point is valid as
 *   judged by `is_valid_reference_point`.
 */
export async function iterate(
  backend: Backend,
  problem: Problem,
  reference_point: Point
): Promise<IterateResponse> {
  if (!is_valid_reference_point(problem, reference_point)) {
    throw new Error("Invalid reference point");
  }
  const response = await backend.with_instance().post("/method/control", {
    response: {
      reference_point,
    },
  });
  return iterateResponseS(problem.objectives.length).parse(response.data);
}

/**
 * Checks if `value` is a valid reference point in the sense that it is an array
 * of finite numbers of the correct length.
 */
export function is_valid_reference_point(
  problem: Problem,
  value: unknown
): value is Point {
  return is_point_of_length(value, problem.objectives.length);
}

//
// Zod schemas
//
// The following section contains schemas for the expected data formats
// of the backend server's responses.
//
// TODO: Is there a nice way to create the base schemas and the refined
// schemas without code duplication?
//

/** Response to the "start method" request. */
const StartResponseS = z
  .object({
    response: z
      .object({
        message: z.string(),
        ideal: PointS,
        nadir: PointS,
      })
      .strict(),
  })
  .strict();

/**
 * Creates a refinement of the `StartResponse` schema with the point length
 * restricted to `n`.
 */
function startResponseS(n: number) {
  return z
    .object({
      response: z
        .object({
          message: z.string(),
          ideal: PointS.length(n),
          nadir: PointS.length(n),
        })
        .strict(),
    })
    .strict();
}

/** Response to the "iterate method" request. */
const IterateResponseS = z
  .object({
    response: z
      .object({
        message: z.string(),
        current_solution: PointS,
        additional_solutions: z.array(PointS),
      })
      .strict(),
  })
  .strict();

/**
 * Creates a refinement of the `IterateResponse` schema with the point length
 * restricted to `n`.
 */
function iterateResponseS(n: number) {
  return z
    .object({
      response: z
        .object({
          message: z.string(),
          current_solution: PointS.length(n),
          additional_solutions: z.array(PointS.length(n)),
        })
        .strict(),
    })
    .strict();
}

export type StartResponse = z.infer<typeof StartResponseS>;
export type IterateResponse = z.infer<typeof IterateResponseS>;
