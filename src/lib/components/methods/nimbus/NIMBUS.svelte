<!--
@component
A user interface for the NIMBUS method.
-->
<script lang="ts">
  //
  // TODO: Fix the way maximization/minimization is presented in the NIMBUS visualization
  //
  // TODO: Improve error handling. Currently we show very general error
  // messages.
  //

  import type { Problem } from "$lib/api";
  import { toastStore } from "@skeletonlabs/skeleton";

  import Visualizations from "$lib/components/util/undecorated/Visualizations.svelte";
  import MethodLayout from "$lib/components/util/undecorated/MethodLayout.svelte";
  import Card from "$lib/components/main/Card.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
  import Table from "$lib/components/util/undecorated/Table.svelte";
  import ParallelCoordinatePlotBase from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlot.svelte";
  import { transform_bounds } from "$lib/components/util/util";

  import { ConicGradient } from "@skeletonlabs/skeleton";
  import type { ConicStop } from "@skeletonlabs/skeleton";
  import ClassificationPreference from "$lib/components/visual/preference-interaction/ClassificationPreference.svelte";
  import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton";
  import Input from "$lib/components/visual/preference-interaction/BasicInput.svelte";

  /** The problem to solve. */
  export let problem: Problem;
  // Link to the backend.
  export let API_URL = "http://localhost:5000/";
  // The authentication token.
  export let AUTH_TOKEN = "";
  // Flag to visualize the decision space. Useful for UTOPIA maybe? Unused for now.
  //export let visualize_decision_space: boolean = false;

  // Enum to represent the state of the method.
  enum State {
    InitialLoad,
    ClassifySelected,
    IntermediateSelected,
    SaveSolutionsSelected,
  }

  // Enum to represent which solutions the DM wants to visualize.
  enum VisualizationChoiceState {
    CurrentSolutions,
    SavedSolutions,
    AllSolutions,
  }

  // The type of the problem info object returned by the backend.
  type problemInfoType = {
    objective_names: string[];
    is_maximized: boolean[];
    lower_bounds: number[];
    upper_bounds: number[];
    previousPreference: number[];
    current_solutions: number[][];
    saved_solutions: number[][];
    all_solutions: number[][];
  };

  // The current state of the method.
  let state: State = State.InitialLoad;
  let visualizationChoiceState: VisualizationChoiceState =
    VisualizationChoiceState.CurrentSolutions;

  // Preference input values.
  let preference: (number | undefined)[];

  let problemInfo: problemInfoType | undefined = undefined;

  // Indexes of currently selected solutions.
  let selected_solutions: number[];

  // The reference solution to be used in the classification preference input component.
  let reference_solution: number[] | undefined;

  // The objective values of the solutions to be visualized.
  let solutions_to_visualize: number[][] | undefined = undefined;

  // The number of intermediate solutions to generate.
  let numIntermediates = 5;
  let MIN_NUM_INTERMEDIATES = 1;
  let MAX_NUM_INTERMEDIATES = 10;

  // Flags to check if the classification/intermediate/save selection are valid.
  let is_classification_valid = false;
  let is_intermediate_selection_valid = false;
  let is_save_solutions_valid = false;

  let max_multiplier: number[] | undefined = undefined;
  let classification_checker = false;

  $: {
    if (problemInfo !== undefined) {
      max_multiplier = problemInfo.is_maximized.map((value) => {
        if (value) {
          return -1;
        } else {
          return 1;
        }
      });
    }
  }

  /* eslint-disable */
  $: {
    if (max_multiplier === undefined || preference === undefined) {
      classification_checker = false;
    } else {
      const pref_less_ref = preference.every(
        (value, index) =>
          value! * max_multiplier![index] <
          reference_solution![index] * max_multiplier![index]
      );

      const pref_greater_ref = preference.every(
        (value, index) =>
          value! * max_multiplier![index] >
          reference_solution![index] * max_multiplier![index]
      );

      if (pref_less_ref || pref_greater_ref) {
        classification_checker = false;
      } else {
        classification_checker = true;
      }
    }
  }

  /* eslint-enable */

  // Check if the classification is valid.
  $: {
    if (!(state === State.ClassifySelected)) {
      is_classification_valid = false;
    } else if (selected_solutions.length > 1) {
      is_classification_valid = false;
    } else if (!classification_checker) {
      is_classification_valid = false;
    } else {
      is_classification_valid = true;
    }
  }

  // Check if the intermediate selection is valid. Exactly two solutions must be selected.
  $: {
    if (!(state === State.IntermediateSelected)) {
      is_intermediate_selection_valid = false;
    } else if (selected_solutions?.length !== 2) {
      is_intermediate_selection_valid = false;
    } else {
      is_intermediate_selection_valid = true;
    }
  }

  // Check if the save solutions selection is valid. At least one solution must be selected.
  $: {
    if (!(state === State.SaveSolutionsSelected)) {
      is_save_solutions_valid = false;
    } else if (selected_solutions?.length === 0) {
      is_save_solutions_valid = false;
    } else {
      is_save_solutions_valid = true;
    }
  }

  // Get the reference solution to be used in the classification preference input component.
  $: {
    if (
      solutions_to_visualize !== undefined &&
      selected_solutions?.length >= 1
    ) {
      reference_solution =
        solutions_to_visualize[
          selected_solutions[selected_solutions.length - 1]
        ];
    }
  }

  $: {
    if (selected_solutions?.length === 0 || selected_solutions === undefined) {
      selected_solutions = [0];
    } else if (
      selected_solutions.length === 1 &&
      selected_solutions[0] === undefined
    ) {
      selected_solutions = [0];
    } else if (
      state === State.ClassifySelected &&
      selected_solutions.length !== 1
    ) {
      selected_solutions = [selected_solutions[selected_solutions.length - 1]];
      selected_solutions = selected_solutions;
    }
  }

  $: {
    if (problemInfo !== undefined) {
      if (
        visualizationChoiceState === VisualizationChoiceState.CurrentSolutions
      ) {
        solutions_to_visualize = problemInfo.current_solutions;
      } else if (
        visualizationChoiceState === VisualizationChoiceState.SavedSolutions
      ) {
        solutions_to_visualize = problemInfo.saved_solutions;
      } else if (
        visualizationChoiceState === VisualizationChoiceState.AllSolutions
      ) {
        solutions_to_visualize = problemInfo.all_solutions;
      }
    }
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

  //
  // TODO: Handle errors bettter.
  //
  async function handle_initialize() {
    try {
      let endpoint = API_URL + "/nimbus/initialize";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problemID: problem, // TODO: This should be the id in the database.
          initialSolution: null, // Backend technically supports this, but we need to add support for it in the UI.
        }),
      });

      if (response.ok) {
        const data: problemInfoType = await response.json();
        problemInfo = data;
        preference = problemInfo.previousPreference;
        state = State.ClassifySelected;
        reference_solution = problemInfo.current_solutions[0];
        selected_solutions = [0];

        state = State.ClassifySelected;
      } else {
        throw new Error("Failed to initialize NIMBUS method.");
      }

      //
    } catch (err) {
      // This is just a temporary solution to make it easier to test the UI
      // without having to run the backend. It should be removed later.

      // TODO: REMOVE THIS WHEN THE BACKEND IS READY!!!
      selected_solutions = [];
      reference_solution = undefined;

      //
      // This handler can be used to restart the solution process. It is probably
      // best to also reset the visualization mode to non-maximized.
      //
      visualizations_maximized = false;

      problemInfo = {
        objective_names: ["Objective 1", "Objective 2", "Objective 3"],
        is_maximized: [false, false, true],
        lower_bounds: [-0, -5, 10],
        upper_bounds: [1, 5, 20],
        previousPreference: [0.6, 1, 15],
        current_solutions: [
          [0.5, 2, 14],
          [0.6, 1, 15],
          [0.7, 3, 13],
        ],
        saved_solutions: [
          [0.8, 4, 12],
          [0.9, 5, 11],
        ],
        all_solutions: [
          [0.5, 2, 14],
          [0.6, 1, 15],
          [0.7, 3, 13],
          [0.8, 4, 12],
          [0.9, 5, 11],
        ],
      };

      preference = problemInfo.previousPreference;
      state = State.ClassifySelected;

      // TODO: Uncomment this when the backend is ready.
      //
      /* toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err); */
    }
  }

  //
  // TODO: Handle errors better.
  //
  async function handle_iterate() {
    if (!is_classification_valid) {
      const err = Error("`handle_iterate` called in wrong state.");
      toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);
    }
    try {
      let endpoint = API_URL + "/nimbus/iterate";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problemID: problem, // The problem is reconstructed from the database each time we iterate.
          preference: preference, // Technically sent as a reference point, the classification is generated in the backend.
          reference_solution: reference_solution, // The reference solution is needed to generate the classification.
        }),
      });

      if (response.ok) {
        const data: problemInfoType = await response.json();
        problemInfo = data;
        preference = problemInfo.previousPreference;
        state = State.ClassifySelected;
        reference_solution = problemInfo.current_solutions[0];
        selected_solutions = [0];
      } else {
        throw new Error("Failed to iterate NIMBUS method.");
      }
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
    }
  }

  async function handle_intermediate() {
    if (
      !is_intermediate_selection_valid ||
      solutions_to_visualize === undefined
    ) {
      throw new Error("`handle_intermediate` called in wrong state.");
    }

    try {
      // This feature should be available for all methods, not just NIMBUS.
      // However, each method endpoint should return the response in the
      // necessary format. In this case, the problemInfoType is returned.
      // The "previousPreference" field is set to be the preference used
      // in the previous classification.
      let endpoint = API_URL + "/nimbus/intermediate";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problemID: problem, // The problem is reconstructed from the database each time we iterate.
          solution1: solutions_to_visualize[selected_solutions[0]],
          solution2: solutions_to_visualize[selected_solutions[1]],
          numIntermediates: numIntermediates,
        }),
      });

      if (response.ok) {
        const data: problemInfoType = await response.json();
        problemInfo = data;
        preference = problemInfo.previousPreference;
        state = State.ClassifySelected; // TODO: Should this be IntermediateSelected? Or should we always return to ClassifySelected?
        reference_solution = problemInfo.current_solutions[0];
        selected_solutions = [0];
      } else {
        // Iteration failed somehow.
        throw new Error("Failed to generate intermediate solutions.");
      }
    } catch (err) {
      // Network error. Authentication error. Server error. etc.
      toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);

      //
    }
  }
  async function handle_save_solutions() {
    if (!is_save_solutions_valid || solutions_to_visualize === undefined) {
      throw new Error("`handle_save_solutions` called in wrong state.");
    }

    try {
      // Same comment about endpoints as in `handle_intermediate`.
      let endpoint = API_URL + "/nimbus/save";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problemID: problem, // The problem is reconstructed from the database each time we iterate.
          solutionsIds: selected_solutions, // Perhaps these should be solution ids from the database.
        }),
      });

      if (response.ok) {
        const data: problemInfoType = await response.json();
        problemInfo = data;
        preference = problemInfo.previousPreference;
        state = State.ClassifySelected; // TODO: Should this be SaveSolutionsSelected? Or should we always return to ClassifySelected?
        reference_solution = problemInfo.current_solutions[0];
        selected_solutions = [0];
      } else {
        // Iteration failed somehow.
        throw new Error("Failed to save solutions.");
      }
    } catch (err) {
      // Network error. Authentication error. Server error. etc.
      toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);

      //
    }
  }

  const conicStops: ConicStop[] = [
    { color: "transparent", start: 0, end: 25 },
    { color: "rgb(var(--color-primary-500))", start: 75, end: 100 },
  ];
</script>

<div class="flex flex-col gap-10">
  <div class="flex flex-col items-start gap-4">
    <h1 class="font-bold">NIMBUS method</h1>
    {#if state === State.InitialLoad}
      <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
      <button class="btn variant-filled" on:click={handle_initialize}>
        click me!
      </button>
    {:else if state === State.ClassifySelected}
      <div class="flex gap-4">
        <button
          class="btn variant-filled"
          on:click={handle_iterate}
          disabled={!is_classification_valid}>Iterate</button
        >
      </div>
      {#if !is_classification_valid}
        <div class="text-error-500">
          Please give a valid classification for the objectives.
        </div>
      {/if}
    {:else if state === State.IntermediateSelected}
      <div class="flex gap-4">
        <button
          class="btn variant-filled"
          on:click={handle_intermediate}
          disabled={!is_intermediate_selection_valid}>Iterate</button
        >
      </div>
      {#if !is_intermediate_selection_valid}
        <div class="text-error-500">Please select two solutions.</div>
      {/if}
    {:else if state === State.SaveSolutionsSelected}
      <div class="flex gap-4">
        <button
          class="btn variant-filled"
          on:click={handle_save_solutions}
          disabled={!is_save_solutions_valid}>Save</button
        >
      </div>
      {#if !is_save_solutions_valid}
        <div class="text-error-500">Please select at least one solution.</div>
      {/if}
    {:else}
      <GeneralError />
    {/if}
  </div>

  {#if state === State.InitialLoad}
    <div class="grid grid-cols-2 items-start gap-10">
      <!-- <ProblemDetails {problem} /> -->
    </div>
  {:else}
    <MethodLayout {visualizations_maximized}>
      <div slot="preferences">
        {#if problemInfo !== undefined && reference_solution !== undefined}
          <Card>
            <svelte:fragment slot="header"
              >Preference information</svelte:fragment
            >
            <RadioGroup>
              <RadioItem
                bind:group={state}
                name="justify"
                value={State.ClassifySelected}>Classify</RadioItem
              >
              <RadioItem
                bind:group={state}
                name="justify"
                value={State.IntermediateSelected}
                >Generate Intermediate</RadioItem
              >
              <RadioItem
                bind:group={state}
                name="justify"
                value={State.SaveSolutionsSelected}>Save solutions</RadioItem
              >
            </RadioGroup>
            <RadioGroup>
              <RadioItem
                bind:group={visualizationChoiceState}
                name="justify"
                value={VisualizationChoiceState.CurrentSolutions}
                >Current solutions</RadioItem
              >
              <RadioItem
                bind:group={visualizationChoiceState}
                name="justify"
                value={VisualizationChoiceState.SavedSolutions}
                >Saved solutions</RadioItem
              >
              <RadioItem
                bind:group={visualizationChoiceState}
                name="justify"
                value={VisualizationChoiceState.AllSolutions}
                >All solutions</RadioItem
              >
            </RadioGroup>
            {#if state === State.ClassifySelected}
              <div>
                Provide your preferences by classifying the objectives by either
                clicking on the bars or using the input boxes. You must give a
                preference for each objective. You must improve and impair at
                least one objective.
              </div>
              <ClassificationPreference
                objective_names={problemInfo.objective_names}
                is_maximized={problemInfo.is_maximized}
                lower_bounds={problemInfo.lower_bounds}
                upper_bounds={problemInfo.upper_bounds}
                solutionValue={reference_solution}
                previousValue={problemInfo.previousPreference}
                bind:preference
                decimalPrecision={3}
              />
            {:else if state === State.IntermediateSelected}
              <div>
                Select two solutions and then click "Iterate" to generate
                intermediate solutions.
              </div>
              <Input
                labelName="Number of intermediate solutions:"
                bind:value={numIntermediates}
                onChange={() => {
                  if (numIntermediates < MIN_NUM_INTERMEDIATES) {
                    numIntermediates = MIN_NUM_INTERMEDIATES;
                  }
                  if (numIntermediates > MAX_NUM_INTERMEDIATES) {
                    numIntermediates = MAX_NUM_INTERMEDIATES;
                  }
                }}
              />
              {#if solutions_to_visualize !== undefined}
                <ParallelCoordinatePlotBase
                  names={problemInfo.objective_names}
                  values={solutions_to_visualize}
                  ranges={transform_bounds(
                    problemInfo.lower_bounds,
                    problemInfo.upper_bounds
                  )}
                  lowerIsBetter={problemInfo.is_maximized.map(
                    (value) => !value
                  )}
                  showIndicators={true}
                  disableInteraction={false}
                  maxSelections={2}
                  bind:selectedIndices={selected_solutions}
                />
              {/if}
            {:else if state === State.SaveSolutionsSelected}
              <div>
                Select any number of solutions and then click "Save" to save
                solutions of interest to the database.
              </div>
              {#if solutions_to_visualize !== undefined}
                <ParallelCoordinatePlotBase
                  names={problemInfo.objective_names}
                  values={solutions_to_visualize}
                  ranges={transform_bounds(
                    problemInfo.lower_bounds,
                    problemInfo.upper_bounds
                  )}
                  lowerIsBetter={problemInfo.is_maximized.map(
                    (value) => !value
                  )}
                  showIndicators={true}
                  disableInteraction={false}
                  maxSelections={solutions_to_visualize.length}
                  bind:selectedIndices={selected_solutions}
                />
              {/if}
            {/if}
          </Card>
        {/if}
      </div>
      <div slot="visualizations">
        {#if state === State.ClassifySelected}
          <Card>
            <svelte:fragment slot="header">Solution Explorer</svelte:fragment>
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

            {#if problemInfo !== undefined && solutions_to_visualize !== undefined}
              <Visualizations
                names={problemInfo.objective_names}
                values={solutions_to_visualize}
                lower_bounds={problemInfo.lower_bounds}
                upper_bounds={problemInfo.upper_bounds}
                lower_is_better={problemInfo.is_maximized.map(
                  (value) => !value
                )}
                grid_mode={gridded_visualizations}
                bind:selected={selected_solutions}
                bind:tab={visualizations_tab}
                max_selections={1}
                mini_nimbus={true}
              />
            {:else}
              <GeneralError />
            {/if}
          </Card>
        {/if}
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
              {#if problemInfo !== undefined && solutions_to_visualize !== undefined}
                <Table
                  head={problemInfo.objective_names}
                  body={solutions_to_visualize.map((solution) => {
                    return solution.map((value) => value.toFixed(decimals));
                  })}
                  bind:selected_rows={selected_solutions}
                />
              {:else}
                <GeneralError />
              {/if}
            </div>
          </div>
        </Card>
      </div>
    </MethodLayout>
  {/if}
</div>
