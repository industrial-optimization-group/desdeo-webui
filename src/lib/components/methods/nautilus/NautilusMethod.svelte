<script lang="ts">
  import { toastStore } from "@skeletonlabs/skeleton";
  import { selectedProblem } from "$lib/api";
  import { PreferenceType, AppState } from "./types";
  import type {
    Iteration,
    NautilusObjectiveData,
    NautilusRanks,
  } from "./types";
  import RankDndZone from "./RankDndZone.svelte";
  import PreferenceSelector from "./PreferenceSelector.svelte";
  import WeightSelection from "./WeightSelection.svelte";
  import IterationsControl from "./IterationsControl.svelte";
  import { colorPalette } from "$lib/components/visual/constants";
  import InfoBox from "./InfoBox.svelte";
  import { inputIterations, stepsTaken } from "./stores";
  import { methodNameStore } from "$lib/components/main/stores";
  import Tooltip from "$lib/components/util/Tooltip.svelte";
  import ProgressObjectiveGrid from "./ProgressObjectiveGrid.svelte";
  import Button from "./Button.svelte";
  import InfoIcon from "~icons/heroicons/information-circle";
  import type { Problem } from "$lib/api";

  let iterationDetails: Iteration[] = [];
  let problem: Problem = $selectedProblem;

  export let API_URL = "http://localhost:5000/";
  export let AUTH_TOKEN = "";
  export let weightPreferences: number[] = [];
  export let inputWeights: number[] = [];
  export let rankPreferences: number[] = [];
  export let distance: number = 0;
  export let objectives: NautilusObjectiveData[] = problem.objectives.map(
    (objective, index) => ({
      name: objective.name,
      minimize: objective.minimize,
      value: 0,
      color: colorPalette[index],
      id: objective.name.replace(/\W/g, "_"),
    })
  );

  let ranks: NautilusRanks = Array.from(
    { length: objectives.length + 1 },
    (_, i) => ({
      name: i === 0 ? "Objectives" : `Rank ${i}`,
      items: [], // Initialize as an empty array for each rank
    })
  );

  /** Initialize the first rank with the objectives. */
  ranks[0].items = [...objectives];

  let preferenceType: PreferenceType = PreferenceType.RANK;
  let appState: AppState = AppState.IDLE;
  let updatedPreferences: number[] = [];

  let totalSteps;
  let optimizationProgress;
  let isPreferencesChanged: boolean | false;
  let stepBack: boolean | false;

  const objectiveRanges = {
    ideal: [] as number[],
    nadir: [] as number[],
  };

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
        weightPreferences = Array($selectedProblem.objectives.length).fill(0);
        rankPreferences = Array($selectedProblem.objectives.length).fill(0);
        inputWeights = Array($selectedProblem.objectives.length).fill(0);
        objectiveRanges.ideal = data.response.ideal;
        objectiveRanges.nadir = data.response.nadir;
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
    console.log("updated", updatedPreferences);

    try {
      appState = AppState.WORKING;
      let endpoint = API_URL + "/method/control";
      console.log("stepBack", stepBack);

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
            preference_info: updatedPreferences,
            use_previous_preference: $stepsTaken < 1 ? undefined : false,
            step_back: $stepsTaken < 1 ? undefined : stepBack,
            short_step: $stepsTaken < 1 ? undefined : false,
          },
        }),
      });
      stepBack = false;
      if (response.ok) {
        appState = AppState.IDLE;
        const data = await response.json();
        console.log(data);
        stepsTaken.update((steps) => steps + 1);
        distance = data.response.distance;

        let iteration: Iteration = {
          currentIterationPoint: data.response.current_iteration_point,
          distance: data.response.distance,
          lowerBounds: data.response.lower_bounds,
          upperBounds: data.response.upper_bounds,
        };

        iterationDetails = [...iterationDetails, iteration];
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

  function handleRankUpdate(event: CustomEvent) {
    updatedPreferences = event.detail.rankPreferences;
  }

  function handleWeightUpdate(event: CustomEvent) {
    updatedPreferences = event.detail.weightPreferences;
  }

  function validate_preferences() {
    /*if (preference_method === 1) {
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
          message: "Please enter weights that sum up to 100.",
          background: "variant-filled-error",
          timeout: 5000,
        });
        return false;
      }
    }
    return true;*/
  }

  function handlePreferenceTypeChange(event: CustomEvent) {
    preferenceType = event.detail.selectedPreference;
  }

  function handleStepBack() {
    stepBack = true;
    iterationDetails = iterationDetails.slice(0, -1);
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
        <RankDndZone
          {objectives}
          {ranks}
          {rankPreferences}
          on:update={handleRankUpdate}
        />
      {:else if preferenceType === PreferenceType.WEIGHT}
        <WeightSelection
          {objectives}
          {weightPreferences}
          {inputWeights}
          on:update={handleWeightUpdate}
        />
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
          disabled={iterationDetails.length < 1 ||
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
    <ProgressObjectiveGrid
      {distance}
      {objectives}
      {objectiveRanges}
      {iterationDetails}
    />
  </div>
</div>

<style>
</style>
