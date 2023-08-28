<script lang="ts">
  import { Table, tableMapperValues } from "@skeletonlabs/skeleton";
  import { problem_has_finite_bounds } from "$lib/api";
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

    // The data returned when interactive is enabled and a row is clicked.
    meta: tableMapperValues(problems, ["id"]),
  };

  // TODO: Specify a type for `meta`
  function handle_selection(meta) {
    const problem_id = meta.detail[0];
    selected_problem = problems.find((problem) => {
      return problem.id === problem_id;
    });
  }
</script>

<div>
  <Table source={data} interactive={true} on:selected={handle_selection} />
</div>
