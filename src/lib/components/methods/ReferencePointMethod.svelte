<script lang="ts">
  import Card from "../main/Card.svelte";
  import HorizontalBarWithInputs from "../visual/HorizontalBarWithInputs.svelte";

  import {
    initialize_reference_point_method,
    type Problem,
    type ObjectivePreference,
  } from "$lib/api";

  export let problem: Problem;
  let objectives: ObjectivePreference[];

  async function initialize(problem: Problem) {
    objectives = await initialize_reference_point_method(problem);
  }

  // Initialize on mount and when the problem changes
  $: initialize(problem);
</script>

<div class="flex flex-col gap-4">
  <h1 class="font-bold">Reference point method</h1>

  <div class="flex gap-2">
    <button class="anchor" on:click={() => initialize(problem)}>Restart</button>
  </div>

  {#if objectives}
    <Card class="max-w-3xl">
      <svelte:fragment slot="header">Preference information</svelte:fragment>
      <div class="flex flex-col gap-4">
        {#each objectives as objective}
          <HorizontalBarWithInputs
            objectiveName={objective.name}
            lowerBound={objective.min}
            higherBound={objective.max}
            bind:selectedValue={objective.preference}
          />
        {/each}
      </div>
    </Card>
  {/if}
</div>
