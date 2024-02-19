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
    let total = weights.reduce((sum, weight) => sum + weight, 0);
    let difference = 100 - total;
    let increment = difference / weights.length;
    let preferenceInfo = $weightPreferences;

    preferenceInfo = weights.map(
      (weight) => Math.round((weight + increment) * 10) / 10
    );

    // If the normalization step caused any weight to become negative, set it to 0
    preferenceInfo = preferenceInfo.map((weight) => (weight < 0 ? 0 : weight));

    weightPreferences.set(preferenceInfo);
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
