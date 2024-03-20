<script lang="ts">
  import { toastStore } from "@skeletonlabs/skeleton";
  import type { Problem } from "$lib/api";
  import RankDndZone from "./RankDndZone.svelte";
  import type { ObjectiveData } from "$lib/methods/nautilus/types";
  import PreferenceSelector from "./PreferenceSelector.svelte";
  import { PreferenceType } from "./types";
  import WeightSelection from "./WeightSelection.svelte";
  import IterationsControl from "./IterationsControl.svelte";
  import { colorPalette } from "$lib/components/visual/constants";
  import InfoBox from "./InfoBox.svelte";
  import {
    inputIterations,
    objectiveRanges,
    iterationDetails,
    weightPreferences,
    rankPreferences,
    inputWeights,
    stepsTaken,
    distance,
  } from "./stores";

  import ProgressObjectiveGrid from "./ProgressObjectiveGrid.svelte";
  import Card from "$lib/components/main/Card.svelte";

  export let API_URL = "http://localhost:5000/";

  export let AUTH_TOKEN = "";

  export let problem: Problem;

  console.log(problem);

  let totalSteps;
  let optimizationProgress;
  let isPreferencesChanged: boolean | false;

  export let objectives: ObjectiveData[] = problem.objectives.map(
    (objective, index) => ({
      ...objective,
      color: colorPalette[index],
      id: objective.name.replace(/\W/g, "_"),
    })
  );

  export let ranks = Array.from({ length: objectives.length + 1 }, (_, i) => ({
    name: i === 0 ? "Objectives" : `Rank ${i}`,
    items: [], // Initialize as an empty array for each rank
  }));

  ranks[0].items = [...objectives];

  let preferenceType: PreferenceType = PreferenceType.RANK;

  handle_initialize();

  async function handle_initialize() {
    console.log("Initializing NAUTILUS method.");

    try {
      let endpoint = API_URL + "/method/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problem_id: problem.id,
          method: "nautilus",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize NAUTILUS method.");
      }
    } catch (err) {
      toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);
    }
    try {
      let endpoint = API_URL + "/method/control";
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
      });
      if (response.ok) {
        const data = await response.json();
        weightPreferences.set(Array(problem.objectives.length).fill(0));
        rankPreferences.set(Array(problem.objectives.length).fill(0));
        inputWeights.set(Array(problem.objectives.length).fill(0));
        objectiveRanges.set({
          ideal: data.response.ideal,
          nadir: data.response.nadir,
        });
      } else {
        throw new Error("Failed to start NAUTILUS method.");
      }
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
    /*if (!validate_preferences()) {
      return;
    }*/

    try {
      let endpoint = API_URL + "/method/control";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          response: {
            n_iterations: $inputIterations.iterations,
            preference_method: preferenceType === "Rank" ? 1 : 2,
            preference_info:
              preferenceType === "Rank" ? $rankPreferences : $weightPreferences,
            use_previous_preference: $stepsTaken < 1 ? undefined : false,
            step_back: $stepsTaken < 1 ? undefined : false,
            short_step: $stepsTaken < 1 ? undefined : false,
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        stepsTaken.update((steps) => steps + 1);
        distance.set(data.response.distance);

        let iteration = {
          currentIterationPoint: data.response.current_iteration_point,
          distance: data.response.distance,
          lowerBounds: data.response.lower_bounds,
          upperBounds: data.response.upper_bounds,
        };

        iterationDetails.update((iterations) => [...iterations, iteration]);
      } else {
        throw new Error("Failed to iterate NAUTILUS method.");
      }
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

  function handlePreferenceTypeChange(event: CustomEvent) {
    preferenceType = event.detail.selectedPreference;
  }

  function handleStepBack() {
    iterationDetails.update((iterations) => iterations.slice(0, -1));
    stepsTaken.update((steps) => steps - 1);
  }

  function handleIterate() {
    handle_iterate();
    console.log($weightPreferences);

    console.log("Step Forward");
  }
</script>

<div class="wrapper">
  <div class="">
    <Card>
      <svelte:fragment slot="header">Preference information</svelte:fragment>
      <PreferenceSelector on:preferenceChange={handlePreferenceTypeChange} />
      {#if preferenceType === PreferenceType.RANK}
        <RankDndZone {objectives} {ranks} />
      {:else if preferenceType === PreferenceType.WEIGHT}
        <WeightSelection {objectives} />
      {/if}
    </Card>
    <Card>
      <svelte:fragment slot="header"
        >Steps before Pareto optimality</svelte:fragment
      >
      <IterationsControl />
      <div class="button-container">
        <button
          on:click={handleStepBack}
          class="iterate-button"
          disabled={$iterationDetails.length < 1}>Step Backwards</button
        >
        <button on:click={handleIterate} class="iterate-button"
          >Step Forward</button
        >
      </div>
    </Card>
  </div>
  <div class="">
    <ProgressObjectiveGrid {objectives} />
  </div>
</div>

<style>
  .iterate-button {
    background-color: #4f9dd9;
    color: rgb(0, 0, 0);
    border: none;
    padding: 10px 10px;
    border-radius: 2px;
    box-shadow: none;
    font-size: 16px;
    margin-top: 20px;
  }
  .button-container {
    display: flex; /* Ensures buttons are in a row */
    gap: 8px; /* Adds some space between buttons */
    align-items: center;
    justify-content: center;
  }
  .wrapper {
    display: grid;
    margin: 10px;
    grid-template-columns: 1fr 2fr;
    gap: 10px;
  }

  button:hover.iterate-button {
    background-color: #2cb1c9; /* Darker red on hover to maintain consistency */
  }

  button:active {
    background-color: #ac2925; /* Even darker red for the press effect */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); /* subtle inset shadow for depth */
  }
</style>
