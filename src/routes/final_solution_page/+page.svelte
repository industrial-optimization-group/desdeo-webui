<script lang="ts">
  import type { Problem } from "$lib/api";
  import { selectedProblem } from "$lib/api";
  import { Table, tableMapperValues } from "@skeletonlabs/skeleton";
  import Card from "$lib/components/main/Card.svelte";
  import { finalSolution } from "$lib/components/methods/nautilus/types";

  let problem: Problem = $selectedProblem;

  $: objectives = {
    head: ["Name", "Goal", "Current"],
    body: tableMapperValues(
      problem.objectives.map(({ name, minimize }, index) => ({
        name,
        goal: minimize ? "minimize" : "maximize",
        current: $finalSolution.currentIterationPoint[index].toFixed(2),
      })),
      ["name", "goal", "current"]
    ),
  };

  $: variables = {
    head: ["Name"],
    body: tableMapperValues(problem.variables, ["name"]),
  };
</script>

<Card>
  <svelte:fragment slot="header">Results</svelte:fragment>
  <div class="flex flex-col gap-2">
    <div><span class="underline">Problem name:</span> {problem.name}</div>
    <div class="underline">Objectives:</div>
    <Table source={objectives} />
    <div class="underline">Variables:</div>
    <Table source={variables} />
  </div>
</Card>
