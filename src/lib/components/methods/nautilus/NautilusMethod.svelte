<!--
@component
A user interface for the reference point method.
-->
<script lang="ts">
  //
  import * as _ from "$lib/methods/nautilus/functional_api";
  import { backend } from "$lib/api";
  import type { Problem } from "$lib/api";
  import { toastStore } from "@skeletonlabs/skeleton";
  import ProblemDetails from "$lib/components/main/ProblemDetails.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
  import Objective from "$lib/components/main/Objective.svelte";

  export let problem: Problem;

  let method: _.Method;
  $: method = _.nautilus_method(backend, problem);

  let preference: (number | undefined)[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let current_iteration_point: number[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let distance: number[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let nadir_point: number[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ideal_point: number[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let lower_bounds: number[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let upper_bounds: number[];

  let preference_info: number[];
  let preference_method: number;
  let n_iterations: number;
  let short_step: boolean;
  let step_back: boolean;
  let use_previous_preference: boolean;

  preference_info = [20, 20, 10, 10, 40];
  preference_method = 2;
  n_iterations = 2;
  short_step = false;
  step_back = false;
  use_previous_preference = false;

  interface Objective {
    name: string;
    minimize: boolean;
  }

  const objectives: Objective[] = problem.objectives;
  async function handle_initialize() {
    try {
      method = await _.initialize(method);
    } catch (err) {
      toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);
    }
  }

  async function handle_iterate() {
    if (_.can_iterate(method)) {
      try {
        method = await _.iterate(
          method,
          n_iterations,
          short_step,
          step_back,
          use_previous_preference,
          preference_method,
          preference_info
        );
        ideal_point = method.problem.ideal_point;
        nadir_point = method.problem.nadir_point;
        current_iteration_point = method.current_iteration_point;
        distance = method.distance;
        lower_bounds = method.lower_bounds;
        upper_bounds = method.upper_bounds;
        console.log("methodLast", method);
      } catch (err) {
        toastStore.trigger({
          // prettier-ignore
          message: "Oops! Something went wrong.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        console.error(err);

        //
        // TODO: We really should do something better. The correct behaviour
        // should depend on the reason for failing and should probably involve
        // adding new states to the state machine. Now we can't really leave
        // the method in the previous state because we don't know the reason
        // for the failure.
        //
        //method = _.reference_point_method(backend, problem);
      }
    }
  }
  console.log("method", method);

  // New reactive variable for toggling objective details
  let showDetails = Array(objectives.length).fill(true);

  // Function to toggle objective details
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function toggleDetails(index: number) {
    showDetails[index] = !showDetails[index];
  }

  // Function to update aspiration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function updateAspiration(index: number, value: number) {
    // Update logic for aspiration value
    preference[index] = value;
    // ... update the backend or state as needed ...
  }
</script>

<div class="flex flex-col gap-10">
  <div class="flex flex-col items-start gap-4">
    <h1 class="font-bold">Nautilus method</h1>
    {#if _.is_uninitialized(method)}
      <div>
        Please click "start" to start solving the problem with the method.
      </div>
      <button class="btn variant-filled" on:click={handle_initialize}
        >Start</button
      >
      <ProblemDetails {problem} />
    {:else if _.is_initialized(method)}
      <div>click "iterate".</div>
      <div class="flex gap-4">
        <button class="btn variant-filled" on:click={handle_iterate}
          >Iterate</button
        >
      </div>
    {:else if _.is_iterated(method)}
      <div>
        Please select a new reference point and then click "iterate", if you
        wish to continue.
      </div>
      <div class="flex gap-4">
        <button class="btn variant-filled" on:click={handle_iterate}
          >Iterate</button
        >
      </div>
    {:else}
      <GeneralError />
    {/if}
  </div>
</div>

<div class="objectives-container">
  <Objective {objectives} {method} />
</div>

<!-- Current solution section -->

<!-- Buttons section -->
<div class="actions">
  <button class="primary">YES</button>
  <button class="secondary">NO</button>
  <!-- ... other buttons ... -->
</div>

<style>
  .objectives-container {
    display: flex;
    overflow-x: auto;
  }

  .primary {
    background-color: #4a90e2;
    color: white;
    /* ... other styles ... */
  }
  .secondary {
    background-color: #f5f5f5;
    /* ... other styles ... */
  }
</style>
