<script lang="ts">
  import { inputIterations } from "./stores";

  let localIterationType: string;
  let localIterations: number;

  function setIterations() {
    inputIterations.set({
      iterationType: localIterationType,
      iterations: localIterations,
    });
  }
</script>

<div class="iteration-settings">
  <div class="radio-group">
    <label>
      <input type="radio" bind:group={localIterationType} value="Manual" />
      Manual
    </label>
    <label>
      <input type="radio" bind:group={localIterationType} value="Automatic" />
      Automatic
    </label>
  </div>

  <div class="number-input-group">
    <input
      type="number"
      bind:value={localIterations}
      min="1"
      disabled={localIterationType === "Automatic"}
    />
    <button
      type="button"
      disabled={localIterationType === "Automatic"}
      on:click={setIterations}>Set</button
    >
  </div>
</div>

<style>
  .iteration-settings {
    display: flex;
    align-items: center;
  }

  .radio-group {
    display: flex; /* Align radio buttons side by side */
    margin-right: 10px; /* Space between radio buttons and the number input */
  }

  .number-input-group {
    display: flex; /* Align number input and button side by side */
    align-items: center;
  }

  input[type="number"] {
    margin-right: 10px; /* Space between the number input and the set button */
  }

  /* Always-visible scroll input arrows for WebKit browsers */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
  }

  /* Style to always show the spinner arrows */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1; /* Makes the spinner buttons always visible */
  }
</style>
