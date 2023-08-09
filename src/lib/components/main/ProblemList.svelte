<script lang="ts">
  import {
    Table,
    tableMapperValues,
    type TableSource,
  } from "@skeletonlabs/skeleton";

  import type { Problem } from "$lib/api";
  export let problems: Problem[];

  let data: TableSource;
  $: data = {
    head: ["Name", "Objectives", "Variables", "Constraints"],
    body: tableMapperValues(problems, [
      "name",
      "n_objectives",
      "n_variables",
      "n_constraints",
    ]),

    // The data returned when interactive is enabled and a row is clicked
    meta: tableMapperValues(problems, ["id"]),
  };

  export let selected_problem: Problem | undefined = undefined;

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
