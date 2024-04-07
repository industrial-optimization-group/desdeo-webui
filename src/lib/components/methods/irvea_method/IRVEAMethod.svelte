<!--
@component
A user interface for the Interactive RVEA Method.
-->
<script lang="ts">

//TODO
//arrow button
//brushing
//textfields only between min/max
//indicate while iterating, disable clicking while
//reset returns original values
//print solution to see what contains -> make dummy solutions for iterating

  import * as _ from "$lib/methods/reference_point_method/functional_api";
  import { backend } from "$lib/api";
  import type { Problem, Point } from "$lib/api";
  import { toastStore } from "@skeletonlabs/skeleton";
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import ReferencePointSelect from "$lib/components/util/undecorated/ReferencePointSelect.svelte";
  import PreferredRangesSelect from "$lib/components/util/undecorated/PreferredRangesSelect.svelte";
  import FinalSolutionPage from "$lib/components/main/FinalSolutionPage.svelte";
  import ProblemDetails from "$lib/components/main/ProblemDetails.svelte";
  import Visualizations from "$lib/components/util/undecorated/Visualizations.svelte";
  import MethodLayout from "$lib/components/util/undecorated/MethodLayout.svelte";
  import Card from "$lib/components/main/Card.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
  import Table from "$lib/components/util/undecorated/Table.svelte";
  import type { Iterated } from "$lib/methods/reference_point_method/functional_api";

  /** The problem to solve. */
  export let problem: Problem;

  let method: _.Method;
  $: method = _.reference_point_method(backend, problem);

  let methodName = writable('');
  let instructions = '';

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

  // Indexes of currently selected solutions.
  let selected_solutions: number[];

  let confirmed_solutions: number[];

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
  const decimals = 4;

  function isIterated(method: _.Method): method is Iterated {
    return 'current_solution' in method;
  }

  let selectedRadio = 'none';

  // Reactive statement to determine if the "Iterate" button should be disabled
  $: isDisabled = (selectedRadio === "none") || (selectedRadio === "inclusion" || selectedRadio === "exclusion") && selected_solutions.length === 0 
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
          solutions = _.all_solutions(method);
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

  async function handle_iterate() {
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
        resolve("Please provide additional preference information and then click \"Iterate\" or select the final solution and click \"Finish\".");
      });
    });
  }

  async function handle_iterate2() {
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

      // Convert the finalSolution object to a string and encode it for URL
      const solutionParam = encodeURIComponent(JSON.stringify(finalSolution));
      
      // Use goto to navigate to the final page with the finalSolution as a URL parameter
      goto(`/final_solution_page?solution=${solutionParam}`);
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

    // You can also set showSettingsModal to false here if you want to automatically close the modal upon saving.
  }

  function handle_reset_selections() {
    // Clear selected solutions
    selected_solutions = [];
  }

  function handle_transfer() {
    switch (selectedRadio) {
        case 'point':
            // Perform the action for when the selected radio is "point"
            console.log('Transfer as point reference');
            break;
        case 'range':
            // Perform the action for when the selected radio is "range"
            console.log('Transfer as preferred ranges');
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

<div class="container flex flex-col gap-10">
  <div class="flex flex-col items-start gap-4">
    <!--<h1 class="font-bold">{$methodName}</h1>-->
    {#if isInitializing}
      <div>Please wait, initializing the method...</div>
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
    <MethodLayout {visualizations_maximized}>
      <div slot="preferences" class="white-background">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <div>
          <strong>Preference Information</strong>
          <span class="info-icon" 
              on:mouseover={() => showHeadingTooltip = true} 
              on:mouseout={() => showHeadingTooltip = false}> ⓘ
            {#if showHeadingTooltip}
              <div class="tooltip">Additional information about preferences goes here.</div>
            {/if}
          </span>

          <div class="instructions">{instructions}</div>

          <div class="max-solutions-input">
            <label for="maxSolutions">Maximum number of solutions
              <span class="info-icon" 
                  on:mouseover={() => showMaxSolutionsTooltip = true} 
                  on:mouseout={() => showMaxSolutionsTooltip = false}> ⓘ
                {#if showMaxSolutionsTooltip}
                  <div class="tooltip">Define the maximum number of solutions you wish to display.</div>
                {/if}
              </span>
            </label>
            <input type="number" id="maxSolutions" bind:value={maxSolutions} min="1" />
          </div>          
          
          <p class="type-of-preferences">
            <strong>Type of Preferences</strong>
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
                <input type="radio" bind:group={selectedRadio} value="point" /> Reference Point
              </label>
              <label>
                <input type="radio" bind:group={selectedRadio} value="range" /> Preferred Ranges
              </label>
            </div>
            
            <!-- Second row of radio buttons -->
            <div class="radio-row">
              <label>
                <input type="radio" bind:group={selectedRadio} value="inclusion" /> Preferred Solutions
              </label>
              <label>
                <input type="radio" bind:group={selectedRadio} value="exclusion" /> Non-preferred Solutions
              </label>
            </div>
          </div>

          {#if selectedRadio === 'none'}
            <div></div>
          {:else if selectedRadio === 'point'}
            <ReferencePointSelect
              objective_names={_.objective_names_with_goals(method)}
              lower_bounds={_.lower_bounds(method)}
              upper_bounds={_.upper_bounds(method)}
              bind:preference
            />
          {:else if selectedRadio === 'range'}
            <PreferredRangesSelect
              objective_names={_.objective_names_with_goals(method)}
              lower_bounds={_.lower_bounds(method)}
              upper_bounds={_.upper_bounds(method)}
              bind:minPreference
              bind:maxPreference
            />
          {:else if selectedRadio === 'inclusion' || selectedRadio === 'exclusion'}
            <div>
              <strong>Confirmed Solutions:</strong>
              {#each confirmed_solutions as solutionIndex}
                <div>
                  Solution {solutionIndex + 1}: 
                  {#each solutions[solutionIndex] as value, i}
                    {_.objective_names_with_goals(method)[i]}: {value.toFixed(4)}
                    {#if i < solutions[solutionIndex].length - 1}, {/if}
                  {/each}
                </div>
              {/each}
            </div>
          {/if}

          <div class="button-container">
            <button class="btn variant-filled" on:click={handle_reset} disabled={disableResetPreferences}>Reset Preferences</button>
            <button class="btn variant-filled" on:click={handle_iterate} disabled={isDisabled}>Iterate</button>
            <button class="btn variant-filled"
              on:click={handle_finish}
              disabled={selected_solutions.length === 0 || selected_solutions.length > 1}>
              Finish
            </button>
          </div>          
        </div>
      </div>
      <div slot="visualizations" class="white-background">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <div>
          <strong>Visualization</strong>
          <span class="info-icon" 
              on:mouseover={() => showVisualizationTooltip = true} 
              on:mouseout={() => showVisualizationTooltip = false}> ⓘ
            {#if showVisualizationTooltip}
              <div class="tooltip">Information about visualization.</div>
            {/if}
          </span>

          <button class="anchor" on:click={() => showSettingsModal = true}>Settings</button>
          
          {#if showSettingsModal}
            <div class="modal">
              <div class="modal-content">
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span class="close" on:click={() => showSettingsModal = false}>&times;</span>
                <p>Settings options to be added here.</p>
                <button on:click={() => showSettingsModal = false}>Close</button>
              </div>
            </div>
          {/if}
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
          <div class="button-container">
            <button on:click={handle_transfer} class="action-button">
              ← Transfer as preferences
              <span class="info-icon" 
                  on:mouseover={() => showArrowButtonTooltip = true} 
                  on:mouseout={() => showArrowButtonTooltip = false}
                  style="margin-left: 8px;"> ⓘ
                {#if showArrowButtonTooltip}
                  <div class="tooltip">Transfer selected solution values to preference information.</div>
                {/if}
              </span>
            </button>
            <div class="button-group-right">
              <button on:click={handle_reset_selections} class="action-button">
                Reset selections
              </button>
              <button on:click={handle_save_selected} class="action-button">
                Save selected
              </button>
            </div>
          </div>           
        </div>
      </div>
      <div slot="solutions" class="white-background">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <div>
          <strong>Solution Table</strong>
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
                  return solution.map((value) => value.toFixed(decimals));
                })}
                bind:selected_rows={selected_solutions}
              />
            </div>
          </div>
        </div>
      </div>
    </MethodLayout>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%; /* Ensure it fills the container it's in */
  }

  .button-container {
    display: flex;
    align-items: center; /* Aligns items vertically center */
    justify-content: flex-end; /* Aligns container content to the right */
    gap: 10px; /* Adds a gap between children */
  }

  .button-group-right {
    display: flex;
    gap: 10px; /* Adjust the spacing between right-side buttons */
  }

  .action-button {
    /* Styling for your action buttons */
    padding: 5px 15px;
    cursor: pointer;
    /* Ensure consistent appearance */
    border: 1px solid #ccc; /* Example border */
    background-color: #f5f5f5; /* Example background */
    margin-left: 8px; /* Space between the buttons, if necessary */
  }

  .button-container-left {
    display: flex;
    align-items: center;
    gap: 10px; /* Adjust the space between the button and the icon */
    margin-bottom: 20px; /* Space before any content that follows */
  }

  .button-container button {
    margin-right: 10px; /* Adjust the spacing to your liking */
  }

  .button-container button:last-child {
    margin-right: 0; /* No right margin on the last button */
  }

  .action-text {
    margin-right: auto; /* Pushes everything else to the right */
    font-weight: bold; /* Makes the text bold */
  }

  .text-error-500 {
    color: #FF4136; /* Example error text color */
    margin-right: auto; /* Ensures any following content is pushed to the right */
  }

  .preference-info {
    flex: 1;
  }

  .visualizations {
    flex: 1;
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
  /* Additional styling */
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

  .tooltip {
    background-color: gray;
    color: white;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    margin-left: -60px; /* Use half of the width (if fixed) to center the tooltip */
    width: 120px; /* Adjust based on content */
    opacity: 0;
    transition: opacity 0.3s;
    visibility: hidden;
  }

  .info-icon:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }

  .arrow-transfer-button {
    background-color: #007bff; /* Example: Blue background */
    color: white;
    border: none;
    cursor: pointer;
    padding: 10px 15px;
    font-size: 16px;
    border-radius: 5px; /* Rounded corners */
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Slight shadow for depth */
    transition: background-color 0.3s; /* Smooth transition for interaction */
  }

  .arrow-transfer-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
  }

  /* Assuming a flex container wraps the visualization and solution sections */
  .flex-container {
    display: flex;
    flex-direction: row; /* Adjust based on your layout preference */
    height: 100vh; /* Full viewport height */
    width: 100%; /* Adjust based on your layout preference */
  }

  /* Style for the visualization and solution divs to control their sizing */
  .right-content {
    flex: 1; /* Adjust the flex-grow value as needed */
    overflow-y: auto; /* Allows vertical scrolling within each section if content is taller than the screen */
    padding: 10px; /* Adjust padding as needed */
  }

  /* Specific style for the table container to make it scrollable */
  .table-container {
    overflow-x: auto; /* Enables horizontal scrolling for the table */
    max-height: 100%; /* Ensures the table does not exceed the section height */
  }

  .white-background {
    background-color: #ffffff; /* White background for content */
    padding: 20px; /* Example padding */
    border: 1px solid #dddddd; /* Example slight border */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Optional: Adds shadow for depth */
  }
</style>
