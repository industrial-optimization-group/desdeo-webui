<!--
@component
A component for displaying objectives
-->
<script lang="ts">
  import Card from "./Card.svelte";
  import type * as _ from "$lib/methods/nautilus/functional_api";

  interface Objective {
    name: string;
    minimize: boolean;
  }
  export let objectives: Objective[];
  export let method: _.Method;

  let showDetails = Array(objectives.length).fill(true);

  // Add any additional logic here
  function toggleDetails(index: number) {
    showDetails[index] = !showDetails[index];
  }
  console.log("objectives", objectives);
  console.log("method", method);
</script>

<Card>
  <svelte:fragment slot="header">Preference information</svelte:fragment>
  <div class="objectives-container">
    {#each objectives as objective, j}
      <div class="objective-card" id={objective.name}>
        <div class="objective-header">
          <h3>{objective.name} (Min)</h3>
          <button on:click={() => toggleDetails(j)}> Hide Details </button>
        </div>
        {#if showDetails[j]}
          <div class="objective-details">
            <!-- Repeat this for each piece of data you need to show -->
            <div class="data-point">
              <span>Objective:</span>
              <span>{objective.name}</span>
            </div>
            <div class="data-point">
              <span>Minimize:</span>
              <span>{objective.minimize ? "Yes" : "No"}</span>
            </div>
            <div class="data-point">
              <span>Ideal Point:</span>
              <span>{method.problem.ideal_point[j]}</span>
            </div>
            <div class="data-point">
              <span>Nadir Point:</span>
              <span>{method.problem.nadir_point[j]}</span>
            </div>

            <!-- ... Other data points ... -->
          </div>
        {/if}
        <div class="objective-slider">
          <label>
            <input type="range" min="0" max="1" step="0.01" />
            <div class="slider-marks">
              <span class="best-value">0</span>
              <span class="worst-value">1</span>
            </div>
          </label>
        </div>
        <div class="iterations-container">
          <!-- Placeholder for iteration bars -->
          <!-- You will generate these based on your data -->
        </div>
      </div>
    {/each}
  </div>
</Card>

<style>
  .objectives-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .objective-card {
    width: 400px;
    /* Add any additional styles here */
  }

  @media (max-width: 600px) {
    .objectives-container {
      flex-direction: column;
    }
  }
</style>
