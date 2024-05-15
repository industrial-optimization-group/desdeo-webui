<script lang="ts">
  import { onMount } from 'svelte';
  import type { Problem } from "$lib/api";

  // Dummy problem for testing Interactive RVEA UI
  const manufacturingOptimizationProblem: Problem = {
    id: 1,
    name: "Manufacturing Optimization Problem",
    type: "Manufacturing",
    objectives: [
      { name: "Cost", minimize: true },
      { name: "Quality", minimize: false },
      { name: "Environmental Impact", minimize: true }
    ],
    variables: [
      { name: "Material Type" },
      { name: "Production Speed" },
      { name: "Temperature" }
    ],
    n_constraints: 0,
    ideal_point: [100, 95, 10], // Ideal low cost, high quality, low environmental impact
    nadir_point: [500, 50, 100] // Worst case high cost, low quality, high environmental impact
  };

  export let problems: Problem[];
  export let selected_problem: Problem | undefined = manufacturingOptimizationProblem; // Dummy problem set as default
  export let hide_saved = false;

  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import ProblemList from "./ProblemList.svelte";
  import ProblemDetails from "./ProblemDetails.svelte";
  import Card from "./Card.svelte";

  /*
   * The active tab. The default is to show the problems provided by DESDEO
   * because saving problems is not yet supported.
   */
  let tab = 1;

  // Dummy problem added, cannot select from list so set as default
  onMount(() => {
    problems = [...problems, manufacturingOptimizationProblem];
  });
</script>

<div class="grid grid-cols-2 gap-10">
  <TabGroup>
    {#if !hide_saved}
      <Tab bind:group={tab} name="saved" value={0}>Your saved problems</Tab>
    {/if}
    <Tab bind:group={tab} name="desdeo" value={1}
      >Problems provided by DESDEO</Tab
    >

    <svelte:fragment slot="panel">
      {#if tab === 0}
        Saving problems is not yet supported. Please take a look at the
        <button
          class="anchor"
          on:click={() => {
            tab = 1;
          }}>problems provided by DESDEO</button
        >.
      {:else if tab === 1}
        <Card>
          <ProblemList {problems} bind:selected_problem />
        </Card>
      {/if}
    </svelte:fragment>
  </TabGroup>
  {#if selected_problem}
    <ProblemDetails problem={selected_problem} />
  {/if}
</div>
