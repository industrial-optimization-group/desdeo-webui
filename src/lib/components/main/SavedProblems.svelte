<script lang="ts">
  import type { SavedProblem } from "$lib/api";
  export let problems: SavedProblem[] = [];

  import Paginator from "./Paginator.svelte";
  import { Table, type TableSource } from "@skeletonlabs/skeleton";
  import { tableMapperValues } from "@skeletonlabs/skeleton";

  const items_per_page = 10;
  let start: number;
  let endExclusive: number;
  let tableSimple: TableSource;

  $: paginatedProblems = problems.slice(start, endExclusive);

  $: tableSimple = {
    head: [
      "Name",
      "No. of objectives",
      "No. of variables",
      "No. of constraints",
    ],
    body: tableMapperValues(paginatedProblems, [
      "problem_name",
      "n_objectives",
      "n_variables",
      "n_constraints",
    ]),
    // Optional: The data returned when interactive is enabled and a row is clicked.
    // meta: tableMapperValues(sourceData, [
    //   "position",
    //   "name",
    //   "symbol",
    //   "weight",
    // ]),
    // Optional: A list of footer labels.
    //foot: ["Total", "", '<code class="code">5</code>'],
  };
</script>

<div class={$$props.class}>
  <dev class="flex justify-end">
    <Paginator
      total_items={problems.length}
      {items_per_page}
      bind:start
      bind:endExclusive
    />
  </dev>
  <Table source={tableSimple} interactive={true} />
</div>
