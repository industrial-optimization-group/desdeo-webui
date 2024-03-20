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

<div class="mr-10 flex items-center justify-center">
  <label class="mr-10">
    <input type="radio" bind:group={localIterationType} value="Manual" />
    Manual
  </label>
  <label>
    <input type="radio" bind:group={localIterationType} value="Automatic" />
    Automatic
  </label>
</div>
<div class="ml-10 mt-5 flex">
  <input
    type="number"
    class="mr-5 w-20"
    bind:value={localIterations}
    min="1"
    disabled={localIterationType === "Automatic"}
  />
  <button
    type="button"
    class="rounded-sm bg-blue-600 p-2"
    disabled={localIterationType === "Automatic"}
    on:click={setIterations}>Set</button
  >
</div>

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
