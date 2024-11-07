<!--
@component
A user interface for the NAUTILUS Navigator method.
-->
<script lang="ts">
  //

  import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton";

  import { get_access_token, selectedProblem } from "$lib/api";
  import { toastStore } from "@skeletonlabs/skeleton";

  import AspirationInput from "$lib/components/methods/nautilus_navigator/AspirationInput.svelte";
  import NAUT_NAVI_LAYOUT from "$lib/components/methods/nautilus_navigator/naut_navi_layout.svelte";
  import { onMount } from "svelte";

  import Card from "$lib/components/main/Card.svelte";
  import { colorPalette } from "$lib/components/visual/constants";
  import { SyncLoader } from "svelte-loading-spinners";
  import type { ChartInput } from "./ReachableRangesFunc.svelte";
  import { RangeChart } from "./ReachableRangesFunc.svelte";

  /** The problem to solve. */
  let problem = $selectedProblem;

  // Link to the backend.
  export let API_URL: string;
  // The authentication token.
  let AUTH_TOKEN = get_access_token();

  // Flag to visualize the decision space. Useful for UTOPIA maybe? Unused for now.
  //export let visualize_decision_space: boolean = false;

  // Enum to represent the state of the method.
  enum State {
    InitialLoad,
    Playing,
    Paused,
    AtBackend,
    ReachedPareto,
    FinalChosen,
  }

  type initResponse = {
    objective_symbols: string[];
    objective_long_names: string[];
    units: string[];
    is_maximized: boolean[];
    ideal: number[];
    nadir: number[];
    total_steps: number;
  };

  type Response = {
    objective_names: string[];
    objective_long_names: string[];
    units: string[];
    is_maximized: boolean[];
    ideal: number[];
    nadir: number[];
    total_steps: number;
    lower_bounds: { [key: string]: number[] };
    upper_bounds: { [key: string]: number[] };
    preferences: { [key: string]: number[] };
    bounds: { [key: string]: number[] };
    reachable_solution: { [key: string]: number };
  };

  // The current state of the method.
  let state: State = State.InitialLoad;

  let objective_names: string[];
  let objective_long_names: string[];
  let units: string[];
  let preference: number[];
  // Bound input values.
  let bounds: number[];
  let preferenceChanged = false;

  let lowerReachables: number[][];
  let upperReachables: number[][];

  let ideal: number[];
  let nadir: number[];
  let maximize: boolean[];

  let pastPreferences: number[][];
  let pastBounds: number[][];

  let inputBoundLow: number[];
  let inputBoundHigh: number[];

  let totalSteps = 100;
  let currentStep = 0;

  let colors: string[];
  let chartinput: ChartInput[] = [];

  let maxStepReached = 0;
  const speedSliderOptions = [500, 400, 300, 200, 100];
  let speedSliderChoice = 3;

  $: {
    if (objective_names !== undefined) {
      colors = colorPalette.slice(0, objective_names.length);
    }
  }
  $: {
    if (maximize !== undefined) {
      inputBoundLow = maximize.map((value, index) => {
        if (value) {
          return nadir[index];
        } else {
          return ideal[index];
        }
      });
      inputBoundHigh = maximize.map((value, index) => {
        if (value) {
          return ideal[index];
        } else {
          return nadir[index];
        }
      });
    }
  }

  /* eslint-disable */
  // Had to disable this rule because it was giving an error for the following code
  // and it was too annoying for me to fix it.
  /*   $: {
    if (preference === undefined || problemInfo === undefined) {
      preference_checker = false;
    } else if (preference.length !== problemInfo.objective_names.length) {
      preference_checker = false;
    } else {
      throw new Error("Preference validation not implemented yet.");
    }
  } */

  /* eslint-enable */

  /** The number of decimals to show for numeric values. */
  // TODO Change this when the frontend is ready.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const decimals = 3;
  let rerender = false;

  function RerenderChart(currentStepInUI?: number) {
    if (
      colors === undefined ||
      objective_names === undefined ||
      objective_long_names === undefined ||
      ideal === undefined ||
      nadir === undefined ||
      maximize === undefined ||
      lowerReachables === undefined ||
      upperReachables === undefined ||
      pastPreferences === undefined ||
      pastBounds === undefined ||
      totalSteps === undefined ||
      currentStep === undefined
    ) {
      console.log("oof");

      return;
    }
    if (bounds === undefined) {
      bounds = nadir.map((value) => +value.toFixed(decimals));
    }
    if (preference === undefined) {
      preference = ideal.map((value, index) => (value + nadir[index]) / 2);
    }

    if (currentStepInUI === undefined) {
      currentStepInUI = currentStep;
    }
    // Clear the chartinput array without losing the reference. This will prevent the RangeChart component from
    // re-rendering with empty data.
    if (chartinput.length !== 0) {
      chartinput.splice(0, chartinput.length);
    }

    // Create the chartinput array with the new data without re-rendering the chart. This will prevent the
    // RangeChart component from re-rendering with partial data.
    for (let i = 0; i < objective_names.length; i++) {
      if (
        pastPreferences[i] === undefined ||
        pastBounds[i] === undefined ||
        pastPreferences[i].length === 0 ||
        pastBounds[i].length === 0 ||
        lowerReachables[i] === undefined ||
        upperReachables[i] === undefined
      ) {
        console.log("oof");
        return;
      }

      chartinput.push({
        lowerBounds: lowerReachables[i].slice(0, currentStepInUI + 1),
        upperBounds: upperReachables[i].slice(0, currentStepInUI + 1),
        idealValue: +ideal[i].toFixed(decimals),
        nadirValue: +nadir[i].toFixed(decimals),
        isMaximized: maximize[i],
        pastPreferences: pastPreferences[i].slice(0, currentStepInUI + 1),
        pastBound: pastBounds[i].slice(0, currentStepInUI + 1),
        currentPreference: preference[i],
        currentBound: bounds[i],
        totalSteps,
        currentStep: currentStepInUI,
        maxStepReached: maxStepReached,
        color: colors[i],
        pastBoundsColor: "red",
        pastPreferencesColor: "blue",
      });
    }
    // Reassign the chartinput array to itself to trigger a re-render of the RangeChart component.
    rerender = true;
    chartinput = chartinput;
  }
  // TODO: Uncomment this when the backend/frontend is ready.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function press_final_button() {
    const modal: ModalSettings = {
      type: "confirm",
      // Data
      title: "Please Confirm",
      body: "Are you sure you wish to proceed?",
      // TRUE if confirm pressed, FALSE if cancel pressed
      response: (r: boolean) => {
        if (r) {
          handle_final_choice();
        } else {
          console.log("Cancelled");
        }
      },
    };
    modalStore.trigger(modal);
  }
  async function handle_initialize() {
    rerender = false;
    try {
      let endpoint = API_URL + "/nautnavi/initialize";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problem_id: problem,
          total_steps: totalSteps,
        }),
      });

      if (response.ok) {
        console.log("Initialized NAUTILUS method.");
        let body: initResponse = await response.json();
        ideal = body.ideal;
        nadir = body.nadir;
        totalSteps = body.total_steps;
        maximize = body.is_maximized;
        lowerReachables = maximize.map((value, index) => {
          if (value) {
            return [body.nadir[index]];
          } else {
            return [body.ideal[index]];
          }
        });
        upperReachables = maximize.map((value, index) => {
          if (value) {
            return [body.ideal[index]];
          } else {
            return [body.nadir[index]];
          }
        });
        console.log(lowerReachables, upperReachables);

        currentStep = 0;
        objective_names = body.objective_symbols;
        objective_long_names = body.objective_long_names;
        units = body.units;

        pastPreferences = ideal.map((value, index) => [
          +((value + body.nadir[index]) / 2).toFixed(decimals),
        ]);
        preference = ideal.map(
          (value, index) => +((value + body.nadir[index]) / 2).toFixed(decimals)
        );
        pastBounds = nadir.map((value, index) => [
          +((value + body.nadir[index]) / 2).toFixed(decimals),
        ]);
        // setTimeout(() => RerenderChart(), 0);
      } else {
        throw new Error("Failed to initialize NAUTILUS method.");
      }
      //
    } catch (err) {
      // TODO: Uncomment this when the backend is ready.
      //
      toastStore.trigger({
        // prettier-ignore
        message: (err as Error).message,
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);
    }
  }
  onMount(async () => {
    await handle_initialize();

    RerenderChart();
  });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function run_steps() {
    if (currentStep < maxStepReached) {
      maxStepReached = currentStep;
    }

    preferenceChanged = false;
    while (maxStepReached < totalSteps) {
      if (state === State.Paused) {
        return;
      }
      maxStepReached++;
      currentStep = maxStepReached;

      RerenderChart(maxStepReached);
      await sleep(speedSliderOptions[speedSliderChoice]);
    }
    state = State.ReachedPareto;
  }

  async function handle_iterate() {
    try {
      rerender = false;
      let endpoint = API_URL + "/nautnavi/navigate";

      let sentPreference: { [key: string]: number } = {};
      objective_names.forEach((name, index) => {
        sentPreference[name] = preference[index];
      });
      let sentBounds: { [key: string]: number } = {};
      objective_names.forEach((name, index) => {
        sentBounds[name] = bounds[index];
      });
      state = State.AtBackend;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify({
          problem_id: problem,
          preference: sentPreference,
          bounds: sentBounds,
          go_back_step: currentStep,
          steps_remaining: totalSteps - currentStep,
        }),
      });

      if (response.ok) {
        console.log("Iterated NAUTILUS method.");
        let body: Response = await response.json();
        ideal = body.ideal;
        nadir = body.nadir;
        totalSteps = body.total_steps;
        maximize = body.is_maximized;
        lowerReachables = Object.values(body.lower_bounds);
        upperReachables = Object.values(body.upper_bounds);
        pastPreferences = Object.values(body.preferences);
        pastBounds = Object.values(body.bounds);
        maxStepReached = currentStep;

        for (let i = 0; i < objective_names.length; i++) {
          pastPreferences[i].unshift(pastPreferences[i][0]);
          pastBounds[i].unshift(pastBounds[i][0]);
        }

        console.log("Iterated!");
      } else {
        throw new Error("Failed to iterate NAUTILUS method.");
      }
      //
    } catch (err) {
      toastStore.trigger({
        // prettier-ignore
        message: "Oops! Something went wrong. Iteration failed at the backend. Most likely reason: bounds too restrictive",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);
    }
  }

  async function handle_save_solutions() {
    try {
      // Same comment about endpoints as in `handle_intermediate`.
      let endpoint = API_URL + "/nautnavi/save";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify("TODO"),
      });

      if (response.ok) {
        console.log("Saved solutions.");
      } else {
        // Iteration failed somehow.
        throw new Error("Failed to save solutions.");
      }
    } catch (err) {
      // Network error. Authentication error. Server error. etc.
      toastStore.trigger({
        // prettier-ignore
        message: "This user account cannot save solutions.",
        background: "variant-filled-error",
        timeout: 5000,
      });
      console.error(err);

      //
    }
  }

  async function handle_final_choice() {
    try {
      let endpoint = API_URL + "/nautnavi/choose";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
        body: JSON.stringify("TODO"),
      });
      if (response.ok) {
        state = State.FinalChosen;
      } else {
        throw new Error("Failed to save final choice.");
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
</script>

<NAUT_NAVI_LAYOUT>
  <div slot="preference">
    {#if state !== State.ReachedPareto}
      <h2 class="font-bold">Preference Information</h2>
      <p class="mb-2">
        Using the input boxes/sliders below, provide objective values you want
        to achieve (aspiration levels) and, optionally, strict bounds you want
        to avoid (bound levels). Press the "Start" button to begin the method.
        You can pause the progress at any time and resume it later. You can also
        take a step back by dragging the black circle on the charts to the left.
        Note that whenever you change your preferences, the method may take a
        few seconds to conduct calculations. You can also adjust the speed at
        which the steps progress by using the slider below. To avoid errors,
        only set bounds for a single objective at a time and run NAUTILUS
        Navigator for atleast one step.
      </p>
      <div>
        {#if preference !== undefined && bounds !== undefined}
          {#each objective_long_names as name, index}
            <!-- Note, this background color doesn't wonk until you remove bg-white from Card. -->
            <div style="background-color: {colors[index]} !important">
              <Card class="mb-2">
                <svelte:fragment slot="header"
                  >{name} (in {units[index]}, {maximize[index]
                    ? "maximize"
                    : "minimize"})</svelte:fragment
                >
                <h5>Aspiration level</h5>
                <AspirationInput
                  objective_name={name}
                  lower_bound={inputBoundLow[index]}
                  upper_bound={inputBoundHigh[index]}
                  bind:preference={preference[index]}
                  objective_color={colors[index]}
                  onChangeFunc={() => {
                    preferenceChanged = true;
                    RerenderChart();
                  }}
                  bar_color={"blue"}
                  {decimals}
                />
                <h5>Bound level</h5>
                <AspirationInput
                  objective_name={name}
                  lower_bound={inputBoundLow[index]}
                  upper_bound={inputBoundHigh[index]}
                  bind:preference={bounds[index]}
                  objective_color={colors[index]}
                  bar_color={"red"}
                  onChangeFunc={() => {
                    preferenceChanged = true;
                    RerenderChart();
                  }}
                  {decimals}
                />
                <table>
                  <tr>
                    <th>&nbsp;</th>
                    <th class="text-center">Reachable</th>
                    <th class="text-center">Full range</th>
                  </tr>
                  <tr>
                    <th>Best Value</th>
                    <td class="text-center"
                      >{maximize[index]
                        ? chartinput[index].upperBounds[
                            chartinput[index].upperBounds.length - 1
                          ].toFixed(decimals)
                        : chartinput[index].lowerBounds[
                            chartinput[index].lowerBounds.length - 1
                          ].toFixed(decimals)}</td
                    >
                    <td class="text-center">{ideal[index].toFixed(decimals)}</td
                    >
                  </tr>
                  <tr>
                    <th>Worst Value</th>
                    <td class="text-center"
                      >{maximize[index]
                        ? chartinput[index].lowerBounds[
                            chartinput[index].lowerBounds.length - 1
                          ].toFixed(decimals)
                        : chartinput[index].upperBounds[
                            chartinput[index].upperBounds.length - 1
                          ].toFixed(decimals)}</td
                    >
                    <td class="text-center">{nadir[index].toFixed(decimals)}</td
                    >
                  </tr>
                </table>
              </Card>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Speed slider -->
      <div class="mt-4">
        <h2 class="font-bold">Speed</h2>
        <input
          type="range"
          min="0"
          max="4"
          step="1"
          bind:value={speedSliderChoice}
          class="slider"
        />
      </div>
    {/if}
    <!-- Buttons -->
    <div>
      {#if state === State.InitialLoad}
        <button
          class="btn variant-filled-primary"
          on:click={async () => {
            await handle_iterate();
            state = State.Playing;
            await run_steps();
          }}
          disabled={state !== State.InitialLoad}
        >
          Start
        </button>
      {/if}
      {#if state === State.Playing}
        <button
          class="btn variant-filled-primary"
          on:click={() => {
            state = State.Paused;
          }}
          disabled={state !== State.Playing}
        >
          Pause
        </button>
      {/if}
      {#if state === State.Paused && !preferenceChanged}
        <button
          class="btn variant-filled-primary"
          on:click={async () => {
            state = State.Playing;
            await run_steps();
          }}
          disabled={state !== State.Paused}
        >
          Resume
        </button>
      {/if}
      {#if state === State.Paused && preferenceChanged}
        <button
          class="btn variant-filled-primary"
          on:click={async () => {
            await handle_iterate();
            state = State.Playing;
            await run_steps();
          }}
          disabled={state !== State.Paused}
        >
          Iterate
        </button>
      {/if}
      {#if state === State.AtBackend}
        <div class="btn variant-filled-primary flex-row">
          <SyncLoader size="20" />
          <p>Conducting calculations...</p>
        </div>
      {/if}
      {#if state === State.ReachedPareto}
        <h2 class="font-bold">Reached Pareto front</h2>
        <p class="mb-2">
          The method has reached the Pareto front. The objective values attained
          by the method are shown below. You can save the solution and end the
          interactive process. Alternatively, you can take a step back to adjust
          your aspirations and bounds to find a different solution. You can do
          this by dragging the black circle on the charts to the left.
        </p>
        <table class="w-full">
          <tr>
            <th class="border-r">Objective</th>
            <th>Value</th>
          </tr>
          {#each objective_long_names as name, index}
            <tr>
              <td class="border-r" style="background-color: {colors[index]};"
                >{name}</td
              >
              <td style="background-color: {colors[index]};"
                >{chartinput[index].lowerBounds[
                  chartinput[index].lowerBounds.length - 1
                ].toFixed(decimals)}</td
              >
            </tr>
          {/each}
        </table>

        <button
          class="btn variant-filled-primary mt-4"
          on:click={handle_save_solutions}
          disabled={state !== State.ReachedPareto}
        >
          Save Solution and end interactive process
        </button>
      {/if}
    </div>
  </div>
  <div slot="visualization">
    <h2 class="font-bold">Visualization</h2>

    {#if preference !== undefined}
      {#each objective_long_names as name, index}
        {#if chartinput[index] !== undefined}
          <Card class="!p-2">
            <svelte:fragment slot="header"
              >{name} (in {units[index]}, {maximize[index]
                ? "maximize"
                : "minimize"})</svelte:fragment
            >
            <div
              style="height: 110px;"
              use:RangeChart={[
                chartinput[index],
                (newCurrentStep) => {
                  currentStep = newCurrentStep;
                  RerenderChart();
                  if (currentStep === totalSteps) {
                    state = State.ReachedPareto;
                  } else if (currentStep === 0) {
                    state = State.InitialLoad;
                  } else {
                    state = State.Paused;
                  }
                },
                rerender,
                state === State.Playing ? false : true,
              ]}
            />
          </Card>
        {/if}
      {/each}
    {/if}
  </div>
</NAUT_NAVI_LAYOUT>
