<script lang="ts">
  import Card from "./Card.svelte";
  import { createEventDispatcher } from "svelte";
  import GDMNautilusBar from "$lib/components/visual/preference-interaction/GDMNautilusBar.svelte";
  import type {
    ObjectiveData,
    IterationData,
  } from "$lib/methods/nautilus/types";

  export let objectives: ObjectiveData[];

  export let iterationData: IterationData[];

  let showDetails = Array(objectives.length).fill(true);
  let useRank = false; // Global switch for using rank or weight

  const dispatch = createEventDispatcher();
  $: {
    dispatch("toggleRankWeight", { useRank });
  }

  function toggleDetails(index: number) {
    showDetails[index] = !showDetails[index];
  }

  function updateValue(index: number, value: number) {
    objectives[index].value = value;
    dispatch("rankUpdate", { index, value });
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

            <div class="input-field">
              <label for={`input-value-${j}`}
                >{useRank ? "Rank" : "Weight (%)"}:</label
              >
              <input
                id={`input-value-${j}`}
                type="number"
                min={useRank ? "1" : "0"}
                max="100"
                placeholder={useRank ? "Rank" : "Weight"}
                bind:value={objective.value}
                on:input={() =>
                  updateValue(j, objective.value ? objective.value : 0)}
              />
            </div>
          </div>
        {/if}
        {#each iterationData as data, index}
          <div class="iteration-section">
            <GDMNautilusBar
              reachableRanges={[data.lower_bounds[j], data.upper_bounds[j]]}
              higherBound={data.nadir_point[j]}
              lowerBound={data.ideal_point[j]}
              currentValue={data.current_iteration_point[j]}
              objIndex={index}
              iteration={data.iteration_counter}
              arrowMode={false}
            />
            <!-- Add other iteration-specific details here -->
          </div>
        {/each}
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

  @media (max-width: 600px) {
    .objectives-container {
      flex-direction: column;
    }
    .objective-card {
      width: 100%; /* Full width for mobile */
    }
  }
</style>
