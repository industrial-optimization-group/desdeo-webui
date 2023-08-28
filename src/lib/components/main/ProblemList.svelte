<script lang="ts">
  import { Table, tableMapperValues } from "@skeletonlabs/skeleton";
  import { problem_has_finite_bounds } from "$lib/api";
  import { z } from "zod";
  import type { Problem } from "$lib/api";
  import type { TableSource } from "@skeletonlabs/skeleton";

  export let problems: Problem[];
  export let selected_problem: Problem | undefined = undefined;

  $: rows = problems.map((problem) => ({
    problem_name: problem.name,
    n_objectives: problem.objectives.length,
    n_variables: problem.variables.length,
    n_constraints: problem.n_constraints,
    has_finite_bounds: problem_has_finite_bounds(problem),
  }));

  let data: TableSource;
  $: data = {
    head: [
      "Name",
      "Objectives",
      "Variables",
      "Constraints",
      "Finite ideal and nadir points",
    ],
    body: tableMapperValues(rows, [
      "problem_name",
      "n_objectives",
      "n_variables",
      "n_constraints",
      "has_finite_bounds",
    ]),

    // The data returned when a row is clicked.
    meta: tableMapperValues(problems, ["id"]),
  };

  //
  // The `selected` event of the table has a detail field, which is a tuple
  // of the values specified above. In this case the tuple consists of the
  // `id` value of the problem, which is a number.
  //
  const schema = z.object({
    detail: z.tuple([z.number()]),
  });

  function handle_selection(meta: unknown) {
    const problem_id = schema.parse(meta).detail[0];
    selected_problem = problems.find(({ id }) => id === problem_id);
  }
</script>

<div>
  <Table source={data} interactive={true} on:selected={handle_selection} />
</div>
