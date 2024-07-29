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
  import InfoBox from "./InfoBox.svelte";

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
      id: "Obj " + (index + 1),
      unit: "",
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
  let buttonDisabled: boolean;

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
    buttonDisabled = true;
  }

  async function handle_initialize() {
    console.log("Initializing NAUTILUS method.");
    methodNameStore.set("NAUTILUS");
    buttonDisabled = true;
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
        objectiveRanges.ideal = data.response.ideal;
        objectiveRanges.nadir = data.response.nadir;

        //TODO: Here is the manual conversion #1 to be removed
        objectiveRanges.ideal = data.response.ideal.map(
          (value: number, index: number, array: number[]) =>
            index !== array.length - 1 ? value * -1 : value
        );
        objectiveRanges.nadir = data.response.nadir.map(
          (value: number, index: number, array: number[]) =>
            index !== array.length - 1 ? value * -1 : value
        );
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
      console.log(
        preferenceType === PreferenceType.RANK
          ? rankPreferences
          : weightPreferences
      );

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

        console.log("iteration point", data.response.current_iteration_point);
        console.log("upper", data.response.upper_bounds);

        //TODO: Here is the manual conversion #2 to be removed
        let iteration: Iteration = {
          currentIterationPoint: data.response.current_iteration_point.map(
            (value: number, index: number, array: number[]) =>
              index !== array.length - 1 ? value * -1 : value
          ),
          distance: data.response.distance,
          lowerBounds: data.response.lower_bounds.map(
            (value: number, index: number, array: number[]) =>
              index !== array.length - 1 ? value * -1 : value
          ),
          upperBounds: data.response.upper_bounds.map(
            (value: number, index: number, array: number[]) =>
              index !== array.length - 1 ? value * -1 : value
          ),
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
    rankPreferences = event.detail.rankPreferences;
    validatePreferences();
  }

  function handleWeightUpdate(event: CustomEvent) {
    weightPreferences = event.detail.weightPreferences;
    validatePreferences();
  }

  function validatePreferences() {
    console.log(buttonDisabled);

    if (
      preferenceType === PreferenceType.RANK &&
      rankPreferences.every((pref) => pref > 0)
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
    validatePreferences();
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

<div class={"flex "}>
  <div class={"w-96 flex-none bg-[#E8EAF0] p-2"}>
    <div>
      <div class={"flex gap-5"}>
        <h2 class="text-lg font-semibold">Preference information</h2>
      </div>
      {#if preferenceType === PreferenceType.RANK}
        <InfoBox
          text={"Provide a ranking by dragging the icons below to indicate the relative importance of improving objective functions at the current step. Each function must be ranked and several functions can have the same rank. Give the highest rank to the most important objective function. Not all ranks need to be used. The ranks can be modified at each step."}
        />
      {:else if preferenceType === PreferenceType.WEIGHT}
        <InfoBox
          text={"Provide points by dragging the sliders below or by using the input boxes to indicate the relative importance of improving objective functions at the current step. The more points you allocate, the more improvement on the corresponding objective is desired at the current step. The points will be internally scaled to sum up to 100 and the colour bar below reflects this."}
        />
      {/if}

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
      <InfoBox
        text={"Set the number of steps to be taken before reaching a Pareto optimal solution"}
      />
      <IterationsControl />
      <div class="bottom sticky left-0 mt-2 flex gap-2 bg-[#E8EAF0] p-2">
        <Button
          on:click={handleStepBack}
          mode="blue"
          disabled={iterationDetails.length < 1 ||
            appState === AppState.WORKING}
          text={"Step backwards"}
        />
        <Button
          on:click={handleIterate}
          disabled={appState === AppState.WORKING || buttonDisabled}
          mode="blue"
          text={"Step forward"}
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
