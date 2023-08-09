<script lang="ts">
  import { Table, tableMapperValues } from "@skeletonlabs/skeleton";
  import Card from "./Card.svelte";
  import type { Problem } from "$lib/api";

  export let problem: Problem;

  $: objectives = {
    head: ["Name", "Minimize"],
    body: tableMapperValues(problem.objectives, ["name", "minimize"]),
  };

  $: variables = {
    head: ["Name"],
    body: tableMapperValues(problem.variables, ["name"]),
  };
</script>

<Card>
  <svelte:fragment slot="header">Problem details</svelte:fragment>
  <div class="flex flex-col gap-2">
    <div><span class="underline">Name:</span> {problem.name}</div>
    <div class="underline">Objectives:</div>
    <Table source={objectives} />
    <div class="underline">Variables:</div>
    <Table source={variables} />
  </div>
</Card>
