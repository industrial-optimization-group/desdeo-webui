<script lang="ts">
  import GDMNautilusBar from "$lib/components/visual/preference-interaction/GDMNautilusBar.svelte";
  import { createEventDispatcher } from "svelte";

  import type {
    ObjectiveData,
    IterationData,
  } from "$lib/methods/nautilus/types";

  export let iterationData: IterationData[];
  export let objectives: ObjectiveData[];
  export let useRank = false;

  const dispatch = createEventDispatcher();

  function updateValue(index: number, value: number) {
    objectives[index].value = value;
    dispatch("rankUpdate", { index, value });
  }
</script>

<div class="objectives-container">
  {#each objectives as objective, j}
    <div class="objective-card" id={objective.name}>
      <div class="objective-header">
        <h3>{objective.name} {objective.minimize ? "(Min)" : "(Max)"}</h3>
      </div>

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

      <div class="scrollable-element">
        {#each iterationData as data, index}
          <div class="iteration-section">
            <GDMNautilusBar
              reachableRanges={[data.lowerBounds[j], data.upperBounds[j]]}
              higherBound={data.nadirPoint[j]}
              lowerBound={data.idealPoint[j]}
              currentValue={data.currentIterationPoint[j]}
              objIndex={index}
              iteration={data.iterationCounter}
              arrowMode={false}
            />
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

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

  .scrollable-element {
    overflow-y: auto;
    max-height: 300px; /* Adjust the maximum height as needed */
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
