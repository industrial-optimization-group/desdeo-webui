<!--
@component
A user interface for the Reference Point Method.

NOTE: Non-functional prototype.
-->
<script lang="ts">
  import * as _ from "$lib/methods/reference_point_method/functional_api";
  import { backend } from "$lib/api";
  import type { BoundedObjective, Problem, Point } from "$lib/api";
  import Card from "../main/Card.svelte";
  import ReferencePointSelect from "../util/undecorated/ReferencePointSelect.svelte";

  import ProblemDetails from "../main/ProblemDetails.svelte";
  // import ParallelCoordinatePlotWithSwap from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotWithSwap.svelte";
  import ParallelCoordinatePlotBase from "../visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";

  /** The problem to solve. */
  export let problem: Problem;

  $: objective_names = problem.objectives.map(({ name }) => name);
  $: objective_minimize = problem.objectives.map(({ minimize }) => minimize);
  $: method = _.reference_point_method(backend, problem);

  let objectives: BoundedObjective[];
  let solutions: Point[];
  let previous_preference: Point;
  let reference_point: Point;

  async function handle_initialize() {
    method = await _.initialize(method);
  }

  async function handle_iterate() {
    method = await _.iterate(method, reference_point);
  }

  $: if (method.state._tag !== "Uninitialized") {
    objectives = method.state.problem.objectives;
  }

  $: if (method.state._tag === "Iterated") {
    solutions = method.state.additional_solutions;
    previous_preference = method.state.previous_preference;
  }
</script>

<div class="grid grid-cols-2 gap-10">
  <div class="flex flex-col gap-10">
    <div class="flex flex-col items-start gap-4">
      <h1 class="font-bold">Reference point method</h1>
      {#if _.is_uninitialized(method)}
        <div>
          Please click "initialize" to start solving the problem with the
          method.
        </div>
        <button class="btn variant-filled" on:click={handle_initialize}
          >Initialize</button
        >
      {:else}
        <div>Please select a reference point and then click "iterate".</div>
        <div class="flex gap-4">
          <button class="btn variant-filled" on:click={handle_iterate}
            >Iterate</button
          >
        </div>
      {/if}
    </div>

    {#if objectives}
      <Card>
        <svelte:fragment slot="header">Preference information</svelte:fragment>
        <ReferencePointSelect
          {objectives}
          selected_solution={solutions ? solutions[0] : undefined}
          {previous_preference}
          bind:reference_point
        />
      </Card>
    {/if}
  </div>

  <div>
    {#if solutions}
      <Card class="h-[600px]">
        <svelte:fragment slot="header">Solutions</svelte:fragment>
        <ParallelCoordinatePlotBase
          names={objective_names}
          values={solutions}
          ranges={objectives.map(({ min, max }) => ({ min, max }))}
          lowerIsBetter={objective_minimize}
          showIndicators={true}
        />
      </Card>
    {:else}
      <ProblemDetails {problem} />
    {/if}
  </div>
</div>
