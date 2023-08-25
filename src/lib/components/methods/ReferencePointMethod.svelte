<!--
@component
A user interface for the Reference Point Method.

NOTE: Non-functional prototype.

TODO: Disable the UI while interacting with the backend.
-->
<script lang="ts">
  import * as _ from "$lib/methods/reference_point_method/functional_api";
  import { backend } from "$lib/api";
  import type { BoundedObjective, Problem, Point } from "$lib/api";
  import Card from "../main/Card.svelte";
  import ReferencePointSelect from "../util/undecorated/ReferencePointSelect.svelte";
  import ProblemDetails from "../main/ProblemDetails.svelte";
  import TabbedVisualizations from "../util/undecorated/TabbedVisualizations.svelte";
  import MethodLayout from "../util/undecorated/MethodLayout.svelte";

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

  let visualizations_maximized = false;
</script>

<div class="flex flex-col gap-10">
  <div class="flex flex-col items-start gap-4">
    <h1 class="font-bold">Reference point method</h1>
    {#if !objectives}
      <div>
        Please click "start" to start solving the problem with the method.
      </div>
      <button class="btn variant-filled" on:click={handle_initialize}
        >Start</button
      >
    {:else if objectives && !solutions}
      <div>Please select a reference point and then click "iterate".</div>
      <div class="flex gap-4">
        <button class="btn variant-filled" on:click={handle_iterate}
          >Iterate</button
        >
      </div>
    {:else}
      <div>
        Please select a new reference point and then click "iterate", if you
        wish to continue.
      </div>
      <div class="flex gap-4">
        <button class="btn variant-filled" on:click={handle_iterate}
          >Iterate</button
        >
        <button
          class="anchor"
          on:click={() => {
            visualizations_maximized = !visualizations_maximized;
          }}>Toggle visualizations size</button
        >
      </div>
    {/if}
  </div>

  <!-- Before start -->
  {#if !objectives}
    <div class="grid grid-cols-2 items-start gap-10">
      <ProblemDetails {problem} />
    </div>
  {/if}

  <!-- Before first iteration -->
  {#if objectives && !solutions}
    <div class="grid grid-cols-2 items-start gap-10">
      <Card>
        <svelte:fragment slot="header">Preference information</svelte:fragment>
        <ReferencePointSelect
          {objectives}
          selected_solution={solutions ? solutions[0] : undefined}
          {previous_preference}
          bind:reference_point
        />
      </Card>
      <ProblemDetails {problem} />
    </div>
  {/if}

  <!-- Has iterated at least once -->
  {#if objectives && solutions}
    <MethodLayout {visualizations_maximized}>
      <div slot="preferences">
        <Card>
          <svelte:fragment slot="header">Preference information</svelte:fragment
          >
          <ReferencePointSelect
            {objectives}
            selected_solution={solutions ? solutions[0] : undefined}
            {previous_preference}
            bind:reference_point
          />
        </Card>
      </div>
      <div slot="visualizations">
        <Card>
          <svelte:fragment slot="header">Visualizations</svelte:fragment>
          <TabbedVisualizations
            names={objective_names}
            values={solutions}
            bounds={objectives.map(({ min, max }) => ({ min, max }))}
            lower_is_better={objective_minimize}
          />
        </Card>
      </div>
      <div slot="solutions">
        <Card>The solutions table will be here.</Card>
      </div>
    </MethodLayout>
  {/if}
</div>
