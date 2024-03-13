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

{#each objectives as objective, index}
  <div class="objective">
    <div class="short-name">{objective.name.substr(0, 6)}</div>
    <div class="color-box" style="background-color: {objective.color};" />
    <input
      type="range"
      min="0"
      max="100"
      bind:value={$inputWeights[index]}
      on:input={(event) => handleInput(index, Number(event.target.value))}
    />
    <input
      type="number"
      min="0"
      max="100"
      class="spinner"
      bind:value={$inputWeights[index]}
      on:change={(event) => handleInput(index, Number(event.target.value))}
    />
  </div>
{/each}

<div class="percentage-bar">
  {#each $weightPreferences as weight, index}
    <div
      class="percentage"
      style="width: {weight}%; background-color: {objectives[index].color};"
    />
  {/each}
</div>

<style>
  .percentage-bar {
    display: flex;
    height: 20px;
    width: 100%;
    margin-top: 10px;
    border: 1px solid #ccc; /* Optional: adds a border to the percentage bar */
  }
  .percentage {
    height: 100%;
  }
  /* Add styles for empty space if needed */
  .percentage:empty {
    background-color: transparent;
  }
  .objective {
    display: flex;
    align-items: center;
    margin-bottom: 10px; /* Adds spacing between each row of inputs */
  }
  .short-name {
    margin-right: 10px;
    font-size: small; /* Adds spacing to the right of the name */
  }
  .color-box {
    width: 20px;
    height: 20px;
    margin-right: 10px; /* Adds spacing to the right of the color box */
  }
  input[type="range"] {
    margin: 0 10px; /* Adds spacing on both sides of the slider */
  }
  .spinner {
    appearance: textfield; /* Defines the standard property 'appearance' for compatibility */
    margin-left: 10px; /* Adds spacing to the left of the spinner */
  }
  /* Style to always show the spinner arrows */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1; /* Makes the spinner buttons always visible */
  }
</style>
