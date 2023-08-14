import type { Backend, Problem } from "$lib/api";
import { z } from "zod";

export class ReferencePointMethod {
  private backend: Backend;
  private problem: Problem;

  //
  // The ideal and nadir points are assigned in `start`.
  //
  // TODO: Does the backend actually calculate these or are they just copied
  // from the problem description?
  //
  private ideal_point: Point | undefined;
  private nadir_point: Point | undefined;

  //
  // The solutions are assigned in `iterate`.
  //
  private current_solution: Point | undefined;
  private additional_solutions: Point[] | undefined;

  constructor(backend: Backend, problem: Problem) {
    this.backend = backend;
    this.problem = problem;
  }

  /**
   * Sets up the method with the problem.
   *
   * @throws Rejects with `AxiosError` with `response.status` set to `406` if
   *   the setup failed for example because the problem is unsupported by the
   *   method.
   */
  private async setup(): Promise<void> {
    await this.backend.with_instance().post("/method/create", {
      problem_id: this.problem.id,
      method: "reference_point_method",
    });
  }

  /**
   * Starts the method.
   *
   * - The caller is responsible for calling `setup` before calling this method.
   */
  private async start(): Promise<StartMethod> {
    const response = await this.backend.with_instance().get("/method/control");
    const data = startMethod(this.problem.n_objectives).parse(response.data);
    this.ideal_point = data.response.ideal;
    this.nadir_point = data.response.nadir;
    return data;
  }

  /**
   * Initializes the method.
   *
   * @throws Rejects with `AxiosError` with `response.status` set to `406` if
   *   the initialization failed for example because the problem is unsupported
   *   by the method.
   */
  async initialize(): Promise<StartMethod> {
    await this.setup();
    return this.start();
  }

  /**
   * Runs one iteration of the method.
   *
   * - The caller is responsible for calling `initialize` before the first
   *   iteration.
   * - The caller is responsible for verifying that the reference point is valid
   *   as judged by `is_valid_reference_point`.
   */
  async iterate(reference_point: Point): Promise<IterateMethod> {
    if (!this.is_valid_reference_point(reference_point)) {
      throw new TypeError("Invalid reference point");
    }
    const response = await this.backend
      .with_instance()
      .post("/method/control", {
        response: {
          reference_point,
        },
      });
    const data = iterateMethod(this.problem.n_objectives).parse(response.data);
    this.current_solution = data.response.current_solution;
    this.additional_solutions = data.response.additional_solutions;
    return data;
  }

  /**
   * Checks if `value` is a valid reference point in the sense that it is an
   * array of finite numbers of the correct length.
   */
  is_valid_reference_point(value: unknown): value is Point {
    // prettier-ignore
    const { success } = 
      Point.length(this.problem.n_objectives).safeParse(value);
    return success;
  }
}

//
// Zod schemas
//
// The following section contains schemas for the expected data formats
// of the backend server's responses.
//
// TODO: Is there a nice way to create the basic schemas and the refined
// schemas without code duplication?
//

const Point = z.array(z.number().finite());

/** Response to the "start method" request. */
const StartMethod = z
  .object({
    response: z
      .object({
        message: z.string(),
        ideal: Point,
        nadir: Point,
      })
      .strict(),
  })
  .strict();

/**
 * Creates a refinement of the `StartMethod` schema with the point length
 * restricted to `n`.
 */
function startMethod(n: number) {
  return z
    .object({
      response: z
        .object({
          message: z.string(),
          ideal: Point.length(n),
          nadir: Point.length(n),
        })
        .strict(),
    })
    .strict();
}

/** Response to the "iterate method" request. */
const IterateMethod = z
  .object({
    response: z
      .object({
        message: z.string(),
        current_solution: Point,
        additional_solutions: z.array(Point),
      })
      .strict(),
  })
  .strict();

/**
 * Creates a refinement of the `IterateMethod` schema with the point length
 * restricted to `n`.
 */
function iterateMethod(n: number) {
  return z
    .object({
      response: z
        .object({
          message: z.string(),
          current_solution: Point.length(n),
          additional_solutions: z.array(Point.length(n)),
        })
        .strict(),
    })
    .strict();
}

export type Point = z.infer<typeof Point>;
export type StartMethod = z.infer<typeof StartMethod>;
export type IterateMethod = z.infer<typeof IterateMethod>;
