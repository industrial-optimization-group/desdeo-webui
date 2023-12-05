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
  let weights: Array<{ rank?: number; weight?: number }> = objectives.map(
    () => ({})
  );

  function toggleDetails(index: number) {
    showDetails[index] = !showDetails[index];
  }

  function updateWeight(index: number, type: "rank" | "weight", value: number) {
    const otherType = type === "rank" ? "weight" : "rank";
    weights[index][type] = value;
    if (value != null) {
      weights[index][otherType] = undefined; // Clear the other field
    }
  }

  console.log("weights", weights);
  console.log("method", method);
</script>

<Card>
  <svelte:fragment slot="header">Preference information</svelte:fragment>
  <div class="objectives-container">
    {#each objectives as objective, j}
      <div class="objective-card" id={objective.name}>
        <div class="objective-header">
          <h3>{objective.name} {objective.minimize ? "(Min)" : "(Max)"}</h3>
          <button on:click={() => toggleDetails(j)}
            >{showDetails[j] ? "Hide" : "Show"} Details</button
          >
        </div>
        {#if showDetails[j]}
          <div class="objective-details">
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
            <div class="input-field">
              <label for={`input-rank-${j}`}>Rank:</label>
              <input
                id={`input-rank-${j}`}
                type="number"
                min="1"
                max="100"
                placeholder="Rank"
                bind:value={weights[j].rank}
                on:input={() => updateWeight(j, "rank", weights[j]?.rank ?? 0)}
              />
            </div>
            <div class="input-field">
              <label for={`input-weight-${j}`}>Weight (%):</label>
              <input
                id={`input-weight-${j}`}
                type="number"
                min="0"
                max="100"
                placeholder="Weight"
                bind:value={weights[j].weight}
                on:input={() =>
                  updateWeight(j, "weight", weights[j]?.weight ?? 0)}
              />
            </div>
          </div>
        {/if}
        <div class="objective-slider">
          <!-- Slider and iteration container as before -->
        </div>
      </div>
    {/each}
  </div>
</Card>

<style>
  .objectives-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .objective-card {
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    width: calc(50% - 10px); /* Adjust width for two cards per row with gap */
  }

  .objective-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .objective-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .data-point {
    display: flex;
    justify-content: space-between;
  }

  .input-field {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
  }

  .input-field label {
    font-size: 0.9em;
    color: #333;
    margin-bottom: 4px;
  }

  .input-field input[type="number"] {
    width: 60px; /* Smaller width for numerical input */
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .objective-slider {
    margin-top: 16px;
  }

  @media (max-width: 600px) {
    .objectives-container {
      flex-direction: column;
    }
    .objective-card {
      width: 100%; /* Full width for mobile */
    }
  }
</style>
