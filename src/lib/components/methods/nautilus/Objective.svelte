<script lang="ts">
  import Card from "../../main/Card.svelte";
  import { createEventDispatcher } from "svelte";
  import ObjectiveDetails from "./ObjectiveDetails.svelte";

  import type {
    ObjectiveData,
    IterationData,
  } from "$lib/methods/nautilus/types";

  export let useRank = false; // Global switch for using rank or weight
  export let iterationData: IterationData[];
  export let objectives: ObjectiveData[];

  const dispatch = createEventDispatcher();
  $: {
    dispatch("toggleRankWeight", { useRank });
  }
  function handleRankUpdate(event: { detail: number }) {
    dispatch("rankUpdate", event.detail);
  }
</script>

<Card>
  <svelte:fragment slot="header">
    Preference information
    <div class="rank-weight-toggle">
      <label class="switch">
        <input type="checkbox" bind:checked={useRank} />
        <span class="slider round" />
      </label>
      <span class="toggle-label">{useRank ? "Rank" : "Weight"}</span>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="default">
    <ObjectiveDetails
      {iterationData}
      {objectives}
      {useRank}
      on:rankUpdate={handleRankUpdate}
    />
  </svelte:fragment>
</Card>

<style>
  .rank-weight-toggle {
    margin-left: auto; /* This will push the toggle to the right */
    display: flex;
    align-items: center;
  }
  .switch {
    position: relative;
    display: inline-block;
    width: 60px; /* Width of the slider */
    height: 34px; /* Height of the slider */
    margin: 0 10px; /* Add some margin around the slider */
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-label {
    font-size: 0.9em;
    color: #333;
    /* No margin needed here, the text will follow the slider */
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ccc;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #2196f3;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
</style>
