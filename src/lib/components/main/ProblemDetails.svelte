<script lang="ts">
  import { Table, tableMapperValues } from "@skeletonlabs/skeleton";
  import Card from "$lib/components/main/Card.svelte";
  import type { SavedProblem } from "$lib/api";

  export let problem: SavedProblem;
  $: console.log(problem);

  $: objectivesData = {
    head: ["Name", "Minimize"],
    body: tableMapperValues(problem.objectives, ["name", "minimize"]),
  };
  $: variablesData = {
    head: ["Name"],
    body: tableMapperValues(problem.variables, ["name"]),
  };
</script>

<Card>
  <svelte:fragment slot="header">Problem details</svelte:fragment>
  <div class="flex flex-col gap-2">
    <div><span class="underline">Name:</span> {problem.name}</div>
    <div class="underline">Objectives:</div>
    <Table source={objectivesData} />
    <div class="underline">Variables:</div>
    <Table source={variablesData} />
  </div>
  <svelte:fragment slot="footer">
    <button class="btn variant-filled"
      >Start solving with the Reference Point Method</button
    >
  </svelte:fragment>
</Card>
