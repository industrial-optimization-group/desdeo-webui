<!--
@component
A user interface for the reference point method.

NOTE: Non-functional prototype.

TODO: Disable the UI while interacting with the backend.

TODO: Update the selected value in the preference information component when
  the user selects a solution.

TODO: Create a reusable visualizations component with the control buttons.
-->
<script lang="ts">
  import * as _ from "$lib/methods/reference_point_method/functional_api";
  import { backend } from "$lib/api";
  import type { Problem } from "$lib/api";

  import ReferencePointSelect from "../util/undecorated/ReferencePointSelect.svelte";
  import ProblemDetails from "../main/ProblemDetails.svelte";
  import Visualizations from "$lib/components/util/undecorated/Visualizations.svelte";
  import MethodLayout from "../util/undecorated/MethodLayout.svelte";
  import Card from "../main/Card.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
  import Table from "$lib/components/util/undecorated/Table.svelte";

  /** The problem to solve. */
  export let problem: Problem;

  //
  // TODO: It could be useful to save the method state and the UI state
  // outside the component. These could be used to restore the state instead
  // of always restarting the method on mount.
  //
  let method: _.Method;
  $: method = _.reference_point_method(backend, problem);

  // Stores the current preference input values.
  let preference: (number | undefined)[];

  let visualizations_maximized = false;
  let visualizations_tab = 0;
  let gridded_visualizations = false;

  $: if (!visualizations_maximized) {
    gridded_visualizations = false;
  }

  // TODO: Handle errors.
  async function handle_initialize() {
    method = await _.initialize(method);
    preference = method.problem.objectives.map(() => undefined);

    //
    // This handler can be used to restart the solution process. It is probably
    // best to also reset the visualizations mode to non-maximized.
    //
    visualizations_maximized = false;
  }

  // TODO: Handle errors.
  async function handle_iterate() {
    if (
      _.can_iterate(method) &&
      _.is_valid_reference_point(method, preference)
    ) {
      method = await _.iterate(method, preference);
    }
  }
</script>

<div class="flex flex-col gap-10">
  <div class="flex flex-col items-start gap-4">
    <h1 class="font-bold">Reference point method</h1>
    {#if _.is_uninitialized(method)}
      <div>
        Please click "start" to start solving the problem with the method.
      </div>
      <button class="btn variant-filled" on:click={handle_initialize}
        >Start</button
      >
    {:else if _.is_initialized(method)}
      <div>Please select a reference point and then click "iterate".</div>
      <div class="flex gap-4">
        <button
          class="btn variant-filled"
          on:click={handle_iterate}
          disabled={!_.is_valid_reference_point(method, preference)}
          >Iterate</button
        >
      </div>
    {:else if _.is_iterated(method)}
      <div>
        Please select a new reference point and then click "iterate", if you
        wish to continue.
      </div>
      <div class="flex gap-4">
        <button
          class="btn variant-filled"
          on:click={handle_iterate}
          disabled={!_.is_valid_reference_point(method, preference)}
          >Iterate</button
        >
      </div>
    {:else}
      <GeneralError />
    {/if}
  </div>

  {#if _.is_uninitialized(method)}
    <div class="grid grid-cols-2 items-start gap-10">
      <ProblemDetails {problem} />
    </div>
  {:else if _.is_initialized(method)}
    <div class="grid grid-cols-2 items-start gap-10">
      <Card>
        <svelte:fragment slot="header">Preference information</svelte:fragment>
        <ReferencePointSelect
          objective_names={_.objective_names_with_goals(method)}
          lower_bounds={_.lower_bounds(method)}
          upper_bounds={_.upper_bounds(method)}
          bind:preference
        />
      </Card>
      <ProblemDetails {problem} />
    </div>
  {:else if _.is_iterated(method)}
    <MethodLayout {visualizations_maximized}>
      <div slot="preferences">
        <Card>
          <svelte:fragment slot="header">Preference information</svelte:fragment
          >
          <ReferencePointSelect
            objective_names={_.objective_names_with_goals(method)}
            lower_bounds={_.lower_bounds(method)}
            upper_bounds={_.upper_bounds(method)}
            bind:preference
            previous_preference={method.previous_preference}
            selected_solution={method.current_solution}
          />
        </Card>
      </div>
      <div slot="visualizations">
        <Card>
          <svelte:fragment slot="header"
            >Solution visualizations</svelte:fragment
          >
          <svelte:fragment slot="buttons">
            <button
              class="anchor"
              on:click={() => {
                gridded_visualizations = !gridded_visualizations;
              }}
              disabled={!visualizations_maximized}>Grid</button
            >
            <button
              class="anchor"
              on:click={() => {
                visualizations_maximized = !visualizations_maximized;
              }}
              >{#if visualizations_maximized}Minimize{:else}Maximize{/if}
            </button>
          </svelte:fragment>
          <Visualizations
            names={_.objective_names_with_goals(method)}
            values={[method.current_solution, ...method.additional_solutions]}
            lower_bounds={_.lower_bounds(method)}
            upper_bounds={_.upper_bounds(method)}
            lower_is_better={method.problem.objectives.map(
              ({ minimize }) => minimize
            )}
            grid_mode={gridded_visualizations}
            max_selections={1}
            bind:tab={visualizations_tab}
          />
        </Card>
      </div>
      <div slot="solutions">
        <Card>
          <svelte:fragment slot="header">Solutions</svelte:fragment>
          <div class="flex flex-col gap-2">
            <p>
              The first solution is the "current solution" as returned by the
              method. The other solutions are the "additional solutions".
            </p>
            <Table head={_.objective_names_with_goals(method)} body={[]} />
          </div>
        </Card>
      </div>
    </MethodLayout>
  {/if}
</div>
