<script lang="ts">
  import { toastStore } from "@skeletonlabs/skeleton";
  import { selectedProblem } from "$lib/api";
  import type { Problem } from "$lib/api";
  import RankDndZone from "./RankDndZone.svelte";
  import type { ObjectiveData } from "$lib/methods/nautilus/types";
  import PreferenceSelector from "./PreferenceSelector.svelte";
  import { PreferenceType, AppState } from "./types";
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
  import { methodNameStore } from "$lib/components/main/stores";
  import Tooltip from "$lib/components/util/Tooltip.svelte";
  import ProgressObjectiveGrid from "./ProgressObjectiveGrid.svelte";
  import Button from "./Button.svelte";
  import InfoIcon from "~icons/heroicons/information-circle";
  export let API_URL = "http://localhost:5000/";

  export let AUTH_TOKEN = "";

  console.log($selectedProblem);

  let totalSteps;
  let optimizationProgress;
  let isPreferencesChanged: boolean | false;

  export let objectives: ObjectiveData[] = $selectedProblem.objectives.map(
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

  let appState: AppState = AppState.IDLE;

  handle_initialize();

  async function handle_initialize() {
    console.log("Initializing NAUTILUS method.");
    methodNameStore.set("NAUTILUS");
    try {
      let endpoint = API_URL + "/method/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problem_id: $selectedProblem.id,
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
        weightPreferences.set(
          Array($selectedProblem.objectives.length).fill(0)
        );
        rankPreferences.set(Array($selectedProblem.objectives.length).fill(0));
        inputWeights.set(Array($selectedProblem.objectives.length).fill(0));
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
      appState = AppState.WORKING;
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
        appState = AppState.IDLE;
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
        appState = AppState.IDLE;
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
    inputIterations.update((current) => {
      return {
        ...current,
        iterations: current.iterations + 1,
      };
    });
  }

  async function handleIterate() {
    await handle_iterate();
  }
</script>

<div class={"flex"}>
  <div class={"w-80 flex-none bg-[#E8EAF0] p-2"}>
    <div>
      <div class={"flex gap-5"}>
        <h2 class="text-lg font-semibold">Preference information</h2>
        <Tooltip
          title="This is a helpful tooltip text for the preference information that can be dismissed by a click."
          dismissByClick={true}
          ><InfoIcon class={"h-6 w-6  text-blue-500"} /></Tooltip
        >
      </div>
      <PreferenceSelector on:preferenceChange={handlePreferenceTypeChange} />
      <InfoBox
        text={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
      />
      {#if preferenceType === PreferenceType.RANK}
        <RankDndZone {objectives} {ranks} />
      {:else if preferenceType === PreferenceType.WEIGHT}
        <WeightSelection {objectives} />
      {/if}
    </div>
    <div>
      <div class={"flex gap-5"}>
        <h2 class="text-lg font-semibold">Steps before Pareto optimality</h2>
        <Tooltip title="This is a helpful tooltip for setting iteration steps."
          ><InfoIcon class={"h-6 w-6  text-blue-500"} /></Tooltip
        >
      </div>
      <IterationsControl />
      <div class="sticky bottom-0 left-0 mt-2 flex gap-2 bg-[#E8EAF0] p-2">
        <Button
          on:click={handleStepBack}
          mode="blue"
          disabled={$iterationDetails.length < 1 ||
            appState === AppState.WORKING}
          text={"Step Backwards"}
        />
        <Button
          on:click={handleIterate}
          disabled={appState === AppState.WORKING}
          mode="blue"
          text={"Step Forward"}
        />
      </div>
    </div>
  </div>
  <div class={"flex w-[1500px] min-w-[1200px] overflow-x-auto"}>
    <ProgressObjectiveGrid {objectives} />
  </div>
</div>

<style>
</style>
