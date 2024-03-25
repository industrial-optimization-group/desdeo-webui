<script lang="ts">
  import { weightPreferences, inputWeights } from "./stores";
  export let objectives;

  function updateWeights() {
    const totalWeight = $inputWeights.reduce((sum, weight) => sum + weight, 0);
    let unroundedPreferenceInfo = $inputWeights.map((weight) =>
      totalWeight > 0 ? (weight / totalWeight) * 100 : 0
    );

    // Round weights to one decimal place
    let roundedPreferenceInfo = unroundedPreferenceInfo.map(
      (weight) => Math.round(weight * 10) / 10
    );

    // Normalize the weights so they sum up to exactly 100
    normalizeWeights(roundedPreferenceInfo);
  }

  function normalizeWeights(weights) {
    // Calculate the total weight
    let total = weights.reduce((sum, weight) => sum + weight, 0);

    // Calculate the percentage weights
    let percentageWeights = weights.map((weight) => (weight / total) * 100);

    // Initially round the weights
    let roundedWeights = percentageWeights.map(
      (weight) => Math.round(weight * 10) / 10
    );

    // Calculate the error due to rounding
    let roundingError =
      100 - roundedWeights.reduce((sum, weight) => sum + weight, 0);

    // Distribute the error
    let errorPerWeight = roundingError / weights.length;
    for (let i = 0; i < roundedWeights.length; i++) {
      roundedWeights[i] += errorPerWeight;
      // Round again after adjusting for error
      roundedWeights[i] = Math.round(roundedWeights[i] * 10) / 10;
    }

    // Due to the second rounding, there might still be an error, fix it by adjusting the last weight
    let finalError =
      100 - roundedWeights.reduce((sum, weight) => sum + weight, 0);
    roundedWeights[roundedWeights.length - 1] += finalError;

    // Set the adjusted weights to the store
    weightPreferences.set(roundedWeights);
  }

  function handleInput(index: number, value: number) {
    inputWeights.update((currentWeights) => {
      // Make a copy of the current array to avoid direct mutation
      let updatedWeights = [...currentWeights];

      // Update the value at the specific index
      updatedWeights[index] = value;

      // Return the updated array to replace the old one
      return updatedWeights;
    });

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
        bind:value={$inputWeights[index]}
        on:input={(event) => handleInput(index, Number(event.target.value))}
      />
      <input
        type="number"
        min="0"
        max="100"
        class={"ml-3 h-10 w-20"}
        bind:value={$inputWeights[index]}
        on:change={(event) => handleInput(index, Number(event.target.value))}
      />
    </div>
  {/each}

  <div
    class="mt-2 flex h-10 w-full border-b border-l border-r border-t border-gray-400"
  >
    {#each $weightPreferences as weight, index}
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
