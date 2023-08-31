<!--
@component
A user interface for the reference point method.
-->
<script lang="ts">
  //
  // TODO: Add support for problems that don't have finite ideal and nadir
  // points as part of the problem description.
  //
  // TODO: Create a reusable visualization component with the control buttons.
  //
  // TODO: Add a feature to stop the solution process and view and visualize
  // the obtained solution (both objectives and variables). There should also
  // be an option to save the final solution to an archive. Something else?
  //
  // TODO: Improve error handling. Currently we show very general error
  // messages.
  //

  import * as _ from "$lib/methods/reference_point_method/functional_api";
  import { backend } from "$lib/api";
  import type { Problem, Point } from "$lib/api";

  import ReferencePointSelect from "$lib/components/util/undecorated/ReferencePointSelect.svelte";
  import ProblemDetails from "$lib/components/main/ProblemDetails.svelte";
  import Visualizations from "$lib/components/util/undecorated/Visualizations.svelte";
  import MethodLayout from "$lib/components/util/undecorated/MethodLayout.svelte";
  import Card from "$lib/components/main/Card.svelte";
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

  //
  // The UI state
  //
  // The following variables store the current state of the UI. They are updated
  // in the handlers and through user interaction.
  //

  // Preference input values.
  let preference: (number | undefined)[];

  //
  // When available, the first solution is the "current solution" as returned
  // by the method, and the rest are the "additional solutions".
  //
  let solutions: Point[];

  // Indexes of currently selected solutions.
  let selected_solutions: number[];

  //
  // TODO: We currently allow selecting multiple solutions but set the reference
  // solution of the preference input component only when precisely one solution
  // is selected. This seemed to provide a nicer UI than only allowing one
  // selection. Do we want to change this behaviour?
  //
  let reference_solution: Point | undefined;

  $: if (
    selected_solutions?.length === 1 &&
    solutions?.length > selected_solutions[0]
  ) {
    reference_solution = solutions[selected_solutions[0]];
  }

  //
  // Index of currently highlighted solution.
  //
  // TODO: Highlighting not implemented. The highlight feature needs to be
  // added to the table component, and then this variable should be used to
  // connect the table and the visualization components.
  //
  // TODO: Would it be useful to be able to highlight multiple solutions? This
  // would require changes to the components.
  //
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let highlighted_solution: number | undefined;

  let visualizations_maximized = false;
  let visualizations_tab = 0;
  let gridded_visualizations = false;

  // Always use tab mode if not in maximized mode.
  $: if (!visualizations_maximized) {
    gridded_visualizations = false;
  }

  /** The number of decimals to show for numeric values. */
  const decimals = 4;

  //
  // The handlers
  //

  // TODO: Handle errors.
  async function handle_initialize() {
    method = await _.initialize(method);
    preference = problem.objectives.map(() => undefined);
    solutions = [];
    selected_solutions = [];
    reference_solution = undefined;
    highlighted_solution = undefined;

    //
    // This handler can be used to restart the solution process. It is probably
    // best to also reset the visualization mode to non-maximized.
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
      preference = method.current_solution;
      solutions = _.all_solutions(method);
      selected_solutions = [];
      reference_solution = method.current_solution;
      highlighted_solution = undefined;
      //
    } else {
      throw new Error("`handle_iterate` called in wrong state.");
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
      {#if !_.is_valid_reference_point(method, preference)}
        <div class="text-error-500">
          Please give each of the aspiration levels a valid numeric value.
        </div>
      {/if}
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
      {#if !_.is_valid_reference_point(method, preference)}
        <div class="text-error-500">
          Please give each of the aspiration levels a valid numeric value.
        </div>
      {/if}
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
            {reference_solution}
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
            values={solutions}
            lower_bounds={_.lower_bounds(method)}
            upper_bounds={_.upper_bounds(method)}
            lower_is_better={method.problem.objectives.map(
              ({ minimize }) => minimize
            )}
            grid_mode={gridded_visualizations}
            bind:selected={selected_solutions}
            bind:tab={visualizations_tab}
          />
        </Card>
      </div>
      <div slot="solutions">
        <Card>
          <svelte:fragment slot="header">Solutions</svelte:fragment>
          <div class="flex flex-col gap-4">
            <p>
              The first solution is the "current solution" as returned by the
              method. The other solutions are the "additional solutions".
            </p>
            <div class="overflow-x-auto">
              <Table
                head={_.objective_names_with_goals(method)}
                body={solutions.map((solution) => {
                  return solution.map((value) => value.toFixed(decimals));
                })}
                bind:selected_rows={selected_solutions}
              />
            </div>
          </div>
        </Card>
      </div>
    </MethodLayout>
  {/if}
</div>
