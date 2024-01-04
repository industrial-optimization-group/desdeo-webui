<!--
@component
A user interface for the NAUTILUS method.
-->
<script lang="ts">
  //
  import * as _ from "$lib/methods/nautilus/functional_api";
  import { backend } from "$lib/api";
  import type { Backend, Problem } from "$lib/api";
  import { toastStore } from "@skeletonlabs/skeleton";
  import ProblemDetails from "$lib/components/main/ProblemDetails.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
  import Objective from "$lib/components/main/Objective.svelte";
  import type {
    ObjectiveData,
    IterationData,
  } from "$lib/methods/nautilus/types";

  export let problem: Problem;

  let method: _.Method;
  $: method = _.nautilus_method(backend, problem);

  let iteration_counter = 0;
  export let iterationData: IterationData[] = [];

  let preference_info: number[];
  let preference_method: number;
  let n_iterations: number;
  let short_step: boolean;
  let step_back: boolean;
  let use_previous_preference: boolean;

  //preference_info = [20, 20, 10, 10, 40];
  //preference_method = 2;
  n_iterations = 5;
  short_step = false;
  step_back = false;
  use_previous_preference = false;

  export let objectives: ObjectiveData[] = problem.objectives;

  async function handle_initialize() {
    try {
      method = await _.initialize(method);

      updateIterationSpecs(method);
      preference_info = Array(method.problem.objectives.length).fill(0);
      preference_method = 2;
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
    if (validate_preferences() === false) {
      return;
    }
    if (_.can_iterate(method)) {
      if (_.is_iterated(method) === false) {
        try {
          console.log("first", preference_info);

          method = await _.firstIteraion(
            method,
            n_iterations,
            preference_method,
            preference_info
          );
          console.log("method", method);

          updateIterationSpecs(method);
        } catch (err) {
          toastStore.trigger({
            // prettier-ignore
            message: "Oops! Something went wrong.",
            background: "variant-filled-error",
            timeout: 5000,
          });
          console.error(err);
        }
      } else {
        try {
          console.log("consecuent", preference_info);

          method = await _.iterate(
            method,
            n_iterations,
            short_step,
            step_back,
            use_previous_preference,
            preference_method,
            preference_info
          );
          updateIterationSpecs(method);
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
    }
  }

  function validate_preferences() {
    if (preference_method === 1) {
      let hasPositiveRank = preference_info.some((element) => element > 0);
      if (!hasPositiveRank) {
        toastStore.trigger({
          message:
            "Please enter at least one objective with a rank above zero.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        return false;
      }

      let hasNegativeRank = preference_info.some((element) => element < 0);
      if (hasNegativeRank) {
        toastStore.trigger({
          message: "Please enter a non-negative rank for each objective.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        return false;
      }
    } else if (preference_method === 2) {
      let sum = 0;
      preference_info.forEach((element) => {
        sum += element;
      });
      if (sum !== 100) {
        toastStore.trigger({
          // prettier-ignore
          message: "Please enter weights that sum up to 100.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        return false;
      }
    }
    return true;
  }

  function handleRankUpdate(event: {
    detail: { index: number; value: number };
  }) {
    const { index, value } = event.detail;
    preference_info[index] = value;
  }

  function handleToggleRankWeight(event: { detail: { useRank: boolean } }) {
    const { useRank } = event.detail;
    preference_method = useRank ? 1 : 2;
  }

  function updateIterations(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    n_iterations = inputElement ? parseInt(inputElement.value, 10) : 1;
  }

  function updateIterationSpecs(method: {
    _tag?: "Initialized" | "Iterated";
    backend?: Backend;
    problem: Problem;
    message?: string;
    ideal_point?: number[];
    nadir_point?: number[];
    current_iteration_point?: number[];
    lower_bounds?: number[];
    upper_bounds?: number[];
    distance?: number[];
  }) {
    let newIteration: IterationData = {
      current_iteration_point: method.current_iteration_point
        ? method.current_iteration_point
        : [],
      distance: method.distance ? method.distance : [],
      nadir_point: method.problem.nadir_point ? method.problem.nadir_point : [],
      ideal_point: method.problem.ideal_point ? method.problem.ideal_point : [],
      lower_bounds: method.lower_bounds ? method.lower_bounds : [],
      upper_bounds: method.upper_bounds ? method.upper_bounds : [],
      iteration_counter: iteration_counter ? iteration_counter : 0,
    };

    iterationData = [...iterationData, newIteration];

    iteration_counter++;
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
    {:else if _.is_initialized(method) || _.is_iterated(method)}
      <div>click "iterate".</div>
      <div class="flex gap-4">
        <div class="iteration-controls">
          <label for="iteration-input" class="iteration-label"
            >Iterations:</label
          >
        </div>
        <input
          class="iteration-input"
          type="number"
          id="iteration-input"
          min="1"
          bind:value={n_iterations}
          on:input={updateIterations}
        />
        <button class="btn variant-filled" on:click={handle_iterate}
          >Iterate</button
        >
      </div>
    {:else}
      <GeneralError />
    {/if}
  </div>
</div>

{#if _.is_initialized(method) || _.is_iterated(method)}
  {console.log("iterations", iterationData)}

  <div class="objectives-container">
    <Objective
      {iterationData}
      {objectives}
      on:rankUpdate={handleRankUpdate}
      on:toggleRankWeight={handleToggleRankWeight}
    />
  </div>
{/if}

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
  .iteration-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .iteration-label {
    font-size: 0.9em;
    color: #333;
  }

  .iteration-input {
    flex: 0 1 auto; /* Allow the input to grow and shrink as needed but not fill the space */
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-right: 10px; /* Ensure some space between the input and the button */
  }
</style>
