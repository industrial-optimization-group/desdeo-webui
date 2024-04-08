<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let objectives;
  export let weightPreferences: number[];
  export let inputWeights: number[];

  const dispatch = createEventDispatcher();

  /** Update the weights based on the input values */
  function updateWeights() {
    const totalWeight = inputWeights.reduce((sum, weight) => sum + weight, 0);
    let unroundedPreferenceInfo = inputWeights.map((weight) =>
      totalWeight > 0 ? (weight / totalWeight) * 100 : 0
    );
    let roundedPreferenceInfo = unroundedPreferenceInfo.map(
      (weight) => Math.round(weight * 10) / 10
    );
    normalizeWeights(roundedPreferenceInfo);
  }
  /**
   * Normalize the weights to 100
   *
   * @param weights
   */
  function normalizeWeights(weights) {
    let total = weights.reduce((sum, weight) => sum + weight, 0);
    let percentageWeights = weights.map((weight) => (weight / total) * 100);
    let roundedWeights = percentageWeights.map(
      (weight) => Math.round(weight * 10) / 10
    );
    let roundingError =
      100 - roundedWeights.reduce((sum, weight) => sum + weight, 0);
    let errorPerWeight = roundingError / weights.length;

    for (let i = 0; i < roundedWeights.length; i++) {
      roundedWeights[i] += errorPerWeight;
      roundedWeights[i] = Math.round(roundedWeights[i] * 10) / 10;
    }

    let finalError =
      100 - roundedWeights.reduce((sum, weight) => sum + weight, 0);
    roundedWeights[roundedWeights.length - 1] += finalError;

    weightPreferences = roundedWeights;

    dispatch("update", { weightPreferences });
  }

  /**
   * Handle the input event
   *
   * @param index Index of the input
   * @param value Value of the input
   */
  function handleInput(index: number, value: number) {
    let updatedWeights = [...inputWeights];
    updatedWeights[index] = value;
    inputWeights = updatedWeights;
    updateWeights();
  }
</script>

<div class={"mb-2"}>
  {#each objectives as objective, index}
    <div class={"mb-3 flex items-center"}>
      <div class={"mr-2 text-xs"}>{objective.name.substr(0, 6)}</div>
      <input
        type="range"
        style="--slider-color: {objective.color};"
        min="0"
        max="100"
        bind:value={inputWeights[index]}
        on:input={(event) => handleInput(index, Number(event.target.value))}
      />
      <input
        type="number"
        min="0"
        max="100"
        class={"ml-3 h-10 w-20"}
        bind:value={inputWeights[index]}
        on:change={(event) => handleInput(index, Number(event.target.value))}
      />
    </div>
  {/each}

  <div
    class="mt-2 flex h-10 w-full border-b border-l border-r border-t border-gray-400"
  >
    {#each weightPreferences as weight, index}
      <div
        class={`h-full ${weight > 0 ? "border-l border-gray-400" : ""}`}
        style="width: {weight}%; background-color: {objectives[index].color};"
      />
    {/each}
  </div>
</div>

<style>
  input[type="range"]::-webkit-slider-thumb {
    margin-top: -3px;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: var(--slider-color);
    border-radius: 5px;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
