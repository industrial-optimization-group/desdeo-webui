<!--
@component
A user interface for the Interactive RVEA method.
-->
<script lang="ts">

//TODO
//textfields only between min/max
//indicate while iterating, disable clicking while
//reset returns original values
//print solution to see what contains -> make dummy solutions for iterating

  import * as _ from "$lib/methods/reference_point_method/functional_api";
  import { backend, selectedProblem } from "$lib/api";
  import type { Problem, Point } from "$lib/api";
  import { toastStore } from "@skeletonlabs/skeleton";
  import { writable } from 'svelte/store';
  import { brushIntervalsStore } from '../../../store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import ReferencePointSelect from "$lib/components/util/undecorated/ReferencePointSelect.svelte";
  import PreferredRangesSelect from "$lib/components/util/undecorated/PreferredRangesSelect.svelte";
  import Visualizations from "$lib/components/util/undecorated/Visualizations.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
  import Table from "$lib/components/util/undecorated/Table.svelte";
  import type { Iterated } from "$lib/methods/reference_point_method/functional_api";

  /** The problem to solve. */
  let problem: Problem = $selectedProblem;

  // DEMO purposes, setting specific ideal and nadir points for visualization ranges
  let ideal_point: Point = [100, 95, 10]; // Ideal points replace with _.lower_bounds(method)
  let nadir_point: Point = [500, 50, 100]; // Nadir points replace with _.upper_bounds(method)

  let method: _.Method;
  $: method = _.reference_point_method(backend, problem);

  let methodName = writable('');
  let instructions = '';

  let brushIntervals: any[] = [];
  brushIntervalsStore.subscribe(value => {
    brushIntervals = value;
  });

  let isInitializing = false;

  let showHeadingTooltip = false;
  let showMaxSolutionsTooltip = false;
  let showPreferencesTooltip = false;
  let showVisualizationTooltip = false;
  let showArrowButtonTooltip = false;
  let showSolutionTableTooltip = false;
  let showSettingsModal = false;

  //
  // The UI state
  //
  // The following variables store the current state of the UI. They are updated
  // in the handlers and through user interaction.
  //

  // Preference input values.
  let preference: (number | undefined)[];

  let minPreference: (number | undefined)[];

  let maxPreference: (number | undefined)[];

  // Previous values stores
  let previousPreference: (number | undefined)[] | undefined;
  let previousMinPreference: (number | undefined)[] | undefined;
  let previousMaxPreference: (number | undefined)[] | undefined;

  let disableResetPreferences = true;

  $: {
    if (selectedRadio === 'none') {
      disableResetPreferences = true;
    } else if (selectedRadio === 'point' && previousPreference === undefined) {
      disableResetPreferences = true;
    } else if (selectedRadio === 'range' && (previousMinPreference === undefined || previousMaxPreference === undefined)) {
      disableResetPreferences = true;
    } else if ((selectedRadio === 'inclusion' || selectedRadio === 'exclusion') && selected_solutions.length === 0) {
      disableResetPreferences = true;
    } else {
      disableResetPreferences = false;
    }
  };

  //
  // When available, the first solution is the "current solution" as returned
  // by the method, and the rest are the "additional solutions".
  //
  let solutions: Point[];

  // DEMO purposes solutions
  let dummySolutions = [
    [150, 90, 20],  // Moderate cost, high quality, low environmental impact
    [300, 70, 60],  // High cost, moderate quality, moderate environmental impact
    [120, 85, 15],  // Low cost, good quality, low environmental impact
    [200, 80, 40],  // Slightly higher cost, slightly lower quality, moderate environmental impact
    [180, 88, 25],  // Balanced cost, high quality, low environmental impact
    [350, 60, 80],  // Very high cost, low quality, high environmental impact
    [100, 95, 5],   // Lowest cost, highest quality, minimal environmental impact
    [250, 75, 30],  // Higher cost, good quality, lower environmental impact
    [220, 65, 50],  // Medium-high cost, lower quality, moderate environmental impact
    [160, 90, 10]   // Moderate cost, high quality, very low environmental impact
  ];

  // Indexes of currently selected solutions.
  let selected_solutions: number[];

  let confirmed_solutions: number[] = [];

  let reference_solution: Point | undefined;

  $: if (
    selected_solutions?.length === 1 &&
    solutions?.length > selected_solutions[0]
  ) {
    reference_solution = solutions[selected_solutions[0]];
  }

  // Index of currently highlighted solution.
  let highlighted_solution: number | undefined;

  let maxSolutions: number | '' = '';

  let visualizations_maximized = false;
  let visualizations_tab = 0;
  let gridded_visualizations = false;

  // Always use tab mode if not in maximized mode.
  $: if (!visualizations_maximized) {
    gridded_visualizations = false;
  }

  /** The number of decimals to show for numeric values. */
  let decimals = writable(2);
  let tempDecimals = 2;

  function handleSaveSettings() {
    decimals.set(tempDecimals); // Apply changes
    showSettingsModal = false; // Close modal
  }

  function isIterated(method: _.Method): method is Iterated {
    return 'current_solution' in method;
  }

  let selectedRadio = 'none';

  // Reactive statement to determine if the "Iterate" button should be disabled
  $: isDisabled = (selectedRadio === "none") || (selectedRadio === "inclusion" || selectedRadio === "exclusion") && confirmed_solutions.length === 0 
    || (selectedRadio === "point" && preference.some(val => val === undefined)) 
    || (selectedRadio === "range" && (minPreference.some(val => val === undefined) || maxPreference.some(val => val === undefined)));

  // Reactive statement to reset selected_solutions when selectedRadio changes
  $: if (selectedRadio === "inclusion" || selectedRadio === "exclusion") {
    handle_reset();
  }

  //
  // The handlers
  //

  async function handle_initialize() {
    isInitializing = true; // Indicate that initialization is starting
    try {
      // Initialize the method
      method = await _.initialize(method);
      // Set default values for preferences
      preference = problem.objectives.map(() => undefined);
      minPreference = problem.objectives.map(() => undefined);
      maxPreference = problem.objectives.map(() => undefined);
      // Set the UI to a state that reflects having solutions
      solutions = [];
      selected_solutions = [];
      reference_solution = undefined;
      highlighted_solution = undefined;
      visualizations_maximized = false;

      // Perform the initial iteration immediately after initialization
      try {
        // TODO iteration set to lower_bound just for initial solutions, FIX
        const iteratedMethod = await _.iterate(method, _.lower_bounds(method));
        if (isIterated(iteratedMethod)) {
          method = iteratedMethod;
          // Safe to access current_solution here
          preference = iteratedMethod.current_solution;
          solutions = selectRandomSolutions(dummySolutions, 3); //_.all_solutions(method);
          selected_solutions = [];
          reference_solution = method.current_solution;
          highlighted_solution = undefined;
        } else {
          // Handle case where method didn't enter the expected state
          // This might involve setting an error state or providing feedback to the user
        }
      } catch (err) {
        // Error handling...
      }

      isInitializing = false; // Reset the flag after successful initialization and initial iteration
    } catch (err) {
      isInitializing = false; // Ensure the flag is reset even if an error occurs
      toastStore.trigger({
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);
    }
  }

  // DEMO purposes
  function selectRandomSolutions(solutions: any[], count: any) {
    const shuffled = solutions.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function handle_reset() {
    // Check if the selectedRadio is 'point' and reset preference to previous
    if (selectedRadio === 'point' && previousPreference !== undefined) {
      preference = [...previousPreference];
    }
    // Check if the selectedRadio is 'range' and reset min and max preferences to previous
    else if (selectedRadio === 'range' && (previousMinPreference !== undefined || previousMaxPreference !== undefined)) {
      if (previousMinPreference !== undefined) {
        minPreference = [...previousMinPreference];
      }
      if (previousMaxPreference !== undefined) {
        maxPreference = [...previousMaxPreference];
      }
    }
    if (selectedRadio === 'inclusion' || selectedRadio === 'exclusion') {
      // Clear confirmed solutions
      confirmed_solutions = [];
    }
  }

  async function handle_iterate_old() {
    // Before proceeding with the iteration logic, save current preferences to previous
    if (selectedRadio === 'point') {
      previousPreference = [...preference]; // Assumes preference is an array
      // Reset min and max since we're working with a point reference
      previousMinPreference = undefined;
      previousMaxPreference = undefined;
    } else if (selectedRadio === 'range') {
      previousMinPreference = [...minPreference]; // Assumes minPreference is an array
      previousMaxPreference = [...maxPreference]; // Assumes maxPreference is an array
      // Reset point preference since we're working with ranges
      previousPreference = undefined;
    }
    if (
      _.can_iterate(method) &&
      _.is_valid_reference_point(method, preference)
    ) {
      try {
        method = await _.iterate(method, preference);
        preference = method.current_solution;
        solutions = _.all_solutions(method);
        selected_solutions = [];
        reference_solution = method.current_solution;
        highlighted_solution = undefined;
      } catch (err) {
        toastStore.trigger({
          message: "Oops! Something went wrong.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        console.error(err);

        method = _.reference_point_method(backend, problem);
      }
    } else if (
      _.can_iterate(method) &&
      _.is_valid_reference_point(method, _.lower_bounds(method))
    ) {
      try {
        method = await _.iterate(method, _.lower_bounds(method));
        preference = method.current_solution;
        solutions = _.all_solutions(method);
        selected_solutions = [];
        reference_solution = method.current_solution;
        highlighted_solution = undefined;
      } catch (err) {
        toastStore.trigger({
          message: "Oops! Something went wrong.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        console.error(err);

        method = _.reference_point_method(backend, problem);
      }
    } else {
      throw new Error("`handle_iterate` called in wrong state.");
    }
  }

  // Invoke the fetch function when the component mounts
  onMount(async () => {
    fetchMethodName();
    await handle_initialize(); // Automatically initialize when the component mounts

    instructions = await fetchInstructions();
  });

  // Function to fetch the method name
  async function fetchMethodName() {
    // Replace this logic with API call logic when the endpoint is available
    methodName.set('Interactive RVEA');
  }

  // Function to fetch the instructions
  async function fetchInstructions(): Promise<string> {
    // Replace this logic with API call logic when the endpoint is available
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Please provide preference information and then click \"Iterate\" or select the final solution and click \"Finish\".");
      });
    });
  }

  async function handle_iterate() {
    if(true) {
      dummyIterate()
    }
    switch (selectedRadio) {
      case "point":
        await iteratePoint();
        break;
      case "range":
        await iterateRange();
        break;
      case "inclusion":
        await iterateInclusion();
        break;
      case "exclusion":
        await iterateExclusion();
        break;
      default:
        console.error("Unknown radio selection");
    }
  }

  // DEMO purposes
  async function dummyIterate() {
    solutions = selectRandomSolutions(dummySolutions, 3);
  }

  async function iteratePoint() {
    previousPreference = [...preference]; // Assumes preference is an array
    // Reset min and max since we're working with a point reference
    previousMinPreference = undefined;
    previousMaxPreference = undefined;
    // Implementation for 'point' preference
  }

  async function iterateRange() {
    previousMinPreference = [...minPreference]; // Assumes minPreference is an array
    previousMaxPreference = [...maxPreference]; // Assumes maxPreference is an array
    // Reset point preference since we're working with ranges
    previousPreference = undefined;
    // Implementation for 'range' preference
  }

  async function iterateInclusion() {
    // Implementation for 'inclusion' preference
  }

  async function iterateExclusion() {
    // Implementation for 'exclusion' preference
  }

  async function handle_finish() {
    const finalSolution = solutions[selected_solutions[0]];
    
    console.log("Saving final solution:", finalSolution);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate an API call

      toastStore.trigger({
        message: "Final solution saved successfully.",
        background: "success",
        timeout: 3000,
      });
      
      // Use goto to navigate to the final page with the finalSolution as a URL parameter
      goto(`/final_solution_page`);
    } catch (error) {
      toastStore.trigger({
        message: "An error occurred while saving the final solution.",
        background: "error",
        timeout: 3000,
      });
      console.error("Error saving final solution:", error);
    }
  }

  function handle_save_selected() {
    // Simulate a backend call with selected_solutions
    console.log("Saving selected solutions:", selected_solutions);
    
    // Simulate success response from the backend
    toastStore.trigger({
      message: "The selected solutions were saved.",
      background: "success", // Adjust according to your toast/notification configuration
      timeout: 3000,
    });
  }

  function handle_reset_selections() {
    // Clear selected solutions
    selected_solutions = [];
  }

  function handle_transfer() {
    switch (selectedRadio) {
      case 'point':
        if (selected_solutions.length === 1) {
          const selectedSolutionIndex = selected_solutions[0];
          const selectedSolutionValues = solutions[selectedSolutionIndex];

          preference = selectedSolutionValues.map(value => value);
          
          console.log('Transfer as point reference with values:', preference);
        } else {
          console.log('Transfer as point reference requires exactly one solution to be selected.');
        }
        break;
      case 'range':
          if (brushIntervals && brushIntervals.length > 0) {
              minPreference = brushIntervals.map(interval => interval.min);
              maxPreference = brushIntervals.map(interval => interval.max);
              console.log('Transferred brush intervals as preferred ranges:', minPreference, maxPreference);
          } else {
              console.log('No brush intervals to transfer.');
          }
          break;
      case 'inclusion':
          // Perform the action for when the selected radio is "inclusion"
          console.log('Transfer as inclusion');
          confirmed_solutions = [...selected_solutions];
          break;
      case 'exclusion':
          // Perform the action for when the selected radio is "exclusion"
          console.log('Transfer as exclusion');
          confirmed_solutions = [...selected_solutions];
          break;
      default:
          console.log('No selected radio action matched');
          break;
    }
  }
</script>

<div class="container">
  <div class="flex flex-col items-start gap-4 pt-5">
    <!--<h1 class="font-bold">{$methodName}</h1>-->
    {#if isInitializing}
      <div style="padding-left: 20px;">Please wait, initializing the method...</div>
    {:else if _.is_initialized(method) || _.is_iterated(method)}
      <div></div>
    <!-- svelte-ignore empty-block -->
    {#if !_.is_valid_reference_point(method, preference)}
    {/if}
    {:else}
      <GeneralError />
    {/if}
  </div>

  {#if _.is_iterated(method)}
  <div class="container">
    <div class="flex flex-row gap-10">
      <!-- Preferences Section on the Left -->
      <div class="preferences-container pt-1">
        <div class="preferences">
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <div>
            <strong>Preference information</strong>
            <span class="info-icon" 
                on:mouseover={() => showHeadingTooltip = true} 
                on:mouseout={() => showHeadingTooltip = false}> ⓘ
              {#if showHeadingTooltip}
                <div class="tooltip-below">Additional information about preferences goes here.</div>
              {/if}
            </span>

            <div class="instructions">{instructions}</div>

            <div class="max-solutions-input">
              <label for="maxSolutions">Maximum number of solutions
                <span class="info-icon" 
                    on:mouseover={() => showMaxSolutionsTooltip = true} 
                    on:mouseout={() => showMaxSolutionsTooltip = false}> ⓘ
                  {#if showMaxSolutionsTooltip}
                    <div class="tooltip-below">Define the maximum number of solutions you wish to display.</div>
                  {/if}
                </span>
              </label>
              <input type="number" id="maxSolutions" bind:value={maxSolutions} min="1" max="99" />
            </div>          
            
            <p class="type-of-preferences">
              <strong>Type of preferences</strong>
              <span class="info-icon" 
                  on:mouseover={() => showPreferencesTooltip = true} 
                  on:mouseout={() => showPreferencesTooltip = false}> ⓘ
                {#if showPreferencesTooltip}
                  <div class="tooltip">Select your preference information type.</div>
                {/if}
              </span>
            </p>        
            
            <div class="radio-group">
              <!-- First row of radio buttons -->
              <div class="radio-row">
                <label>
                  <input type="radio" bind:group={selectedRadio} value="point" /> Reference point
                </label>
                <label>
                  <input type="radio" bind:group={selectedRadio} value="range" /> Preferred ranges
                </label>
              </div>
              
              <!-- Second row of radio buttons -->
              <div class="radio-row">
                <label>
                  <input type="radio" bind:group={selectedRadio} value="inclusion" /> Preferred solutions
                </label>
                <label>
                  <input type="radio" bind:group={selectedRadio} value="exclusion" /> Non-preferred solutions
                </label>
              </div>
            </div>

            {#if selectedRadio === 'none'}
              <div></div>
            {:else if selectedRadio === 'point'}
              <ReferencePointSelect
                objective_names={_.objective_names_with_goals(method)}
                lower_bounds={ideal_point}
                upper_bounds={nadir_point}
                bind:preference
                previous_preference={method.previous_preference}
                {reference_solution}
              />
            {:else if selectedRadio === 'range'}
              <PreferredRangesSelect
                objective_names={_.objective_names_with_goals(method)}
                lower_bounds={ideal_point}
                upper_bounds={nadir_point}
                bind:minPreference
                bind:maxPreference
              />
            {:else if selectedRadio === 'inclusion' || selectedRadio === 'exclusion'}
              <div class="pt-5">
                <strong>Confirmed Solutions:</strong>
                {#if confirmed_solutions.length === 0}
                  <div>None</div>
                {:else}
                  {#each confirmed_solutions as solutionIndex}
                    <div>
                      Solution {solutionIndex + 1}
                    </div>
                  {/each}
                {/if}
              </div>
            {/if}     
          </div>
        </div>
        <div class="button-container">
          <button class="btn variant-filled" on:click={handle_reset} disabled={disableResetPreferences}>Reset preferences</button>
          <button class="btn variant-filled" on:click={handle_iterate} disabled={isDisabled}>Iterate</button>
          <button class="btn variant-filled"
            on:click={handle_finish}
            disabled={selected_solutions.length === 0 || selected_solutions.length > 1}>
            Finish
          </button>
        </div>
      </div>

      <div class="visualizations-solutions-container p-5">
        <div class="visualizations">
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <div>
            <div class="header-flex">
              <div>
                  <strong>Visualization</strong>
                  <span class="info-icon" 
                        on:mouseover={() => showVisualizationTooltip = true} 
                        on:mouseout={() => showVisualizationTooltip = false}> ⓘ
                      {#if showVisualizationTooltip}
                          <div class="tooltip-below">Information about visualization.</div>
                      {/if}
                  </span>
              </div>
              <button class="anchor" on:click={() => showSettingsModal = true}>Settings</button>
            </div>

            {#if showSettingsModal}
              <div class="modal">
                <div class="modal-content">
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <span class="close" on:click={() => showSettingsModal = false}>&times;</span>
                  <h2 style="font-weight: bold; margin-bottom: 20px;">Adjust your settings</h2>
                  <form on:submit|preventDefault={handleSaveSettings}>
                    <div class="modal-form">
                      <label for="decimalInput">Number of decimals:</label>
                      <input id="decimalInput" type="number" min="0" max="10" bind:value={tempDecimals}>
                    </div>

                    <div class="modal-buttons">
                      <button type="submit" class="btn variant-filled">Save settings</button>
                      <button type="button" on:click={() => showSettingsModal = false} class="btn variant-filled">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            {/if}
            <Visualizations
              names={_.objective_names_with_goals(method)}
              values={solutions}
              lower_bounds={ideal_point}
              upper_bounds={nadir_point}
              lower_is_better={method.problem.objectives.map(
                ({ minimize }) => minimize
              )}
              grid_mode={gridded_visualizations}
              bind:selected={selected_solutions}
              bind:tab={visualizations_tab}
            />
            <div class="button-container-divided">
              <div class="button-group-left">
                <button on:click={handle_transfer} class="transfer-button">
                  ← Transfer as preferences
                  <span class="info-icon-white" 
                      on:mouseover={() => showArrowButtonTooltip = true} 
                      on:mouseout={() => showArrowButtonTooltip = false}
                      style="margin-left: 8px;"> ⓘ
                    {#if showArrowButtonTooltip}
                      <div class="tooltip">Transfer selected solution values to preference information.</div>
                    {/if}
                  </span>
                </button>
              </div>
              <div class="button-group-right">
                <button on:click={handle_reset_selections} class="btn variant-filled">
                  Reset selections
                </button>
                <button on:click={handle_save_selected} class="btn variant-filled">
                  Save selected
                </button>
              </div>
            </div>           
          </div>
        </div>
        <div class="solutions">
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <div>
            <strong>Solution table</strong>
            <span class="info-icon" 
                on:mouseover={() => showSolutionTableTooltip = true} 
                on:mouseout={() => showSolutionTableTooltip = false}> ⓘ
              {#if showSolutionTableTooltip}
                <div class="tooltip">Details about the solution table.</div>
              {/if}
            </span>

            <div class="flex flex-col gap-4">
              <div class="overflow-x-auto">
                <Table
                  head={_.objective_names_with_goals(method)}
                  body={solutions.map((solution) => {
                    return solution.map((value) => value.toFixed($decimals));
                  })}
                  bind:selected_rows={selected_solutions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    height: 94vh;
  }

  .preferences-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* This will push the button container to the bottom */
    background-color: rgb(230, 230, 230);
    height: 100%; /* Full height of its container */
    overflow: hidden; /* Hides any overflow */
  }

  .visualizations-solutions-container {
    flex: 0 0 60%; /* This will now explicitly occupy 60% of the container */
    width: 60%; /* Explicitly define the width as 60% */
    overflow-y: auto; /* This container will handle the overflow */
    background-color: white;
  }

  .preferences {
    flex-grow: 1; /* Allows this element to grow and fill available space */
    overflow-y: auto; /* Scrollable content */
    padding: 1rem; /* Provides padding around the content */
  }

  .visualizations, .solutions {
    overflow-y: visible; /* No more scroll bars here */
    max-height: 100%; /* Ensures the content does not expand the container */
  }

  .transfer-button {
    padding: 8px 15px;
    border: none;
    background-color: rgb(49, 58, 80);
    color: white;
    border-radius: 2px;
    cursor: pointer;
    font-size: 16px;
  }

  .transfer-button:hover {
    background-color: rgba(49, 58, 80, 0.9);
  }

  .button-container {
    display: flex;
    align-items: center; /* Aligns items vertically center */
    justify-content: flex-end; /* Aligns container content to the right */
    gap: 10px; /* Adds a gap between children */
    padding: 10px; /* Padding around the buttons */
  }

  .button-container-divided {
    display: flex;
    align-items: center; /* Aligns items vertically center */
    justify-content: space-between; /* Aligns container content to the right */
    gap: 10px; /* Adds a gap between children */
    padding: 10px; /* Padding around the buttons */
  }

  .button-group-left, .button-group-right {
    display: flex;
    gap: 10px; /* Adjust the spacing between right-side buttons */
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 5px; /* Reduced gap between rows */
  }

  .radio-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Create two columns, each taking up half the row */
    gap: 0px; /* Adjust the gap between grid items if needed, this controls horizontal spacing */
  }

  label {
    display: flex;
    align-items: center; /* Aligns the radio button and text vertically */
    margin: 0; /* Remove default margins if needed */
  }

  input[type="radio"] {
    margin-right: 5px; /* Adjust space between radio button and text */
  }

  .max-solutions-input {
    display: flex;
    align-items: center;
    margin-top: 10px; /* Adjust spacing as needed */
  }

  .max-solutions-input label {
    margin-right: 10px; /* Space between label and input */
  }

  .max-solutions-input input[type="number"] {
    width: auto; /* Adjust based on design */
    padding: 5px; /* Adjust based on design */
  }

  .type-of-preferences {
    margin-top: 20px; /* Adjust the space above the text as needed */
  }

  .header-flex {
    display: flex;
    align-items: center; /* Vertical alignment */
    justify-content: space-between; /* Horizontal distribution */
    width: 100%; /* Full width */
  }

  .modal {
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
    max-width: 500px; /* Maximum width */
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    gap: 10px; /* Space between buttons */
  }

  .modal-form {
    display: flex;
    align-items: center; /* Align items vertically */
    margin-bottom: 20px;
    gap: 10px;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  .info-icon {
    color: blue;
    cursor: help;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
  }

  .info-icon-white {
    color: white;
    cursor: help;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
  }

  .tooltip {
    background-color: white;
    color: black;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    width: 120px;
    opacity: 0;
    transition: opacity 0.3s;
    visibility: hidden;
  }

  .tooltip-below {
    background-color: white;
    color: black;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    width: 120px;
    opacity: 0;
    transition: opacity 0.3s;
    visibility: hidden;
  }

  .info-icon:hover .tooltip, .tooltip-below {
    opacity: 1;
    visibility: visible;
  }

  .info-icon-white:hover .tooltip, .tooltip-below {
    opacity: 1;
    visibility: visible;
  }
</style>
