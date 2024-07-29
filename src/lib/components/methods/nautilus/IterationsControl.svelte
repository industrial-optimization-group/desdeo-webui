<script lang="ts">
  import { inputIterations } from "./stores";
  import Button from "./Button.svelte";

  let localIterationType: string;
  let localIterations: number;

  function setIterations() {
    inputIterations.set({
      iterationType: localIterationType,
      iterations: localIterations,
    });
  }
</script>

<div>
  <div class="mr-10 mt-2 flex">
    <label class="mr-10">
      <input type="radio" bind:group={localIterationType} value="Manual" />
      Manual
    </label>
    <label>
      <input type="radio" bind:group={localIterationType} value="Automatic" />
      Automatic
    </label>
  </div>
  <div class="mb-5 mt-5 flex">
    <input
      type="number"
      class={"mr-5 h-10 w-20"}
      bind:value={localIterations}
      min="1"
      disabled={localIterationType === "Automatic"}
    />
    <Button
      disabled={localIterationType === "Automatic"}
      on:click={setIterations}
      text={"Set"}
    />
  </div>
</div>

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
