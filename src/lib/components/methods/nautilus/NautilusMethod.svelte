<script lang="ts">
  import { toastStore } from "@skeletonlabs/skeleton";
  import { selectedProblem } from "$lib/api";
  import { PreferenceType, AppState, finalSolution } from "./types";
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
  import { inputIterations, stepsTaken } from "./stores";
  import { methodNameStore } from "$lib/components/main/stores";
  import Tooltip from "$lib/components/util/Tooltip.svelte";
  import ProgressObjectiveGrid from "./ProgressObjectiveGrid.svelte";
  import Button from "./Button.svelte";
  import InfoIcon from "~icons/heroicons/information-circle";
  import { goto } from "$app/navigation";
  import type { Problem } from "$lib/api";
  import { onDestroy, onMount } from "svelte";
  import { inputWeights } from "./stores";

  let iterationDetails: Iteration[] = [];
  let problem: Problem = $selectedProblem;

  export let API_URL = "http://localhost:5000/";
  export let AUTH_TOKEN = "";
  export let weightPreferences: number[] = [];
  //export let inputWeights: number[] = [];
  export let rankPreferences: number[] = [];
  export let distance = 0;
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

  /** Initialize the first "rank" as objectives. */
  ranks[0].items = [...objectives];

  let preferenceType: PreferenceType = PreferenceType.RANK;
  let appState: AppState = AppState.IDLE;
  let buttonDisabled: boolean | true;

  let stepBack: boolean | false;

  const objectiveRanges = {
    ideal: [] as number[],
    nadir: [] as number[],
  };

  onMount(async () => {
    await handle_initialize();
  });

  onDestroy(() => {
    reset();
  });

  function reset() {
    ranks[0].items = [...objectives];
    preferenceType = PreferenceType.RANK;
    appState = AppState.IDLE;
    stepBack = false;
    objectiveRanges.ideal = [];
    objectiveRanges.nadir = [];
    inputIterations.update((current) => {
      return {
        ...current,
        iterations: 5,
      };
    });
    stepsTaken.set(0);
    iterationDetails = [];
  }

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
        inputWeights.set(Array($selectedProblem.objectives.length).fill(0));
        //inputWeights = Array($selectedProblem.objectives.length).fill(0);
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
            preference_info:
              preferenceType === PreferenceType.RANK
                ? rankPreferences
                : weightPreferences,
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
    validatePreferences();
    rankPreferences = event.detail.rankPreferences;
  }

  function handleWeightUpdate(event: CustomEvent) {
    validatePreferences();
    weightPreferences = event.detail.weightPreferences;
    console.log(weightPreferences);
  }

  function validatePreferences() {
    if (
      preferenceType === PreferenceType.RANK &&
      rankPreferences.some((pref) => pref > 0)
    ) {
      buttonDisabled = false;
    } else if (
      preferenceType === PreferenceType.WEIGHT &&
      weightPreferences.some((pref) => pref > 0)
    ) {
      buttonDisabled = false;
    } else buttonDisabled = true;
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

  async function handleFinnish() {
    finalSolution.set(iterationDetails[iterationDetails.length - 1]);
    console.log($finalSolution);
    goto("/final_solution_page");
  }
</script>

<div class={"flex"}>
  <div class={"w-96 flex-none bg-[#E8EAF0] p-2"}>
    <div>
      <div class={"flex gap-5"}>
        <h2 class="text-lg font-semibold">Preference information</h2>
      </div>
      <PreferenceSelector on:preferenceChange={handlePreferenceTypeChange} />
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
          on:update={handleWeightUpdate}
        />
      {/if}
    </div>
    <div>
      <div class={"flex gap-5"}>
        <h2 class="text-lg font-semibold">Steps before Pareto optimality</h2>
        <Tooltip
          title="Ranges of objective functions that are reachable without trade-offs are visualized on the right. When approaching Pareto optimal solutions, the ranges shrink. Determine how many steps to take before reaching a Pareto optimal solution. This number can be changed any time."
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
          disabled={appState === AppState.WORKING || buttonDisabled}
          mode="blue"
          text={"Step Forward"}
        />
        <Button
          on:click={handleFinnish}
          disabled={appState === AppState.WORKING || buttonDisabled}
          mode="blue"
          text={"Show results"}
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
