<script lang="ts">
  import Card from "$lib/components/main/Card.svelte";
  import type { ObjectiveData } from "$lib/methods/nautilus/types";
  import GDMNautilusBar from "$lib/components/visual/preference-interaction/GDMNautilusBar.svelte";
  import {
    iterationDetails,
    objectiveRanges,
    stepsTaken,
    inputIterations,
    distance,
  } from "./stores";

  export let objectives: ObjectiveData[];

  $: progressPercentage = $distance;
</script>

<Card>
  <svelte:fragment slot="header">
    <h2 class="text-lg font-semibold">Reachable Values</h2>
  </svelte:fragment>

  <div class="flex items-center justify-between">
    <p class="text-sm font-light">
      Step {$stepsTaken} of {$inputIterations.iterations}
    </p>
    <div>
      <p class="mb-1 text-sm font-light">
        Closeness of current step to optimality
      </p>
      <div class="relative pt-1">
        <div class="flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
          <div
            style="width: {progressPercentage}%;"
            class="flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white transition-all"
          />
        </div>
        <div class="right-0 top-0 mr-2 mt-1">
          {Math.round(progressPercentage)}%
        </div>
      </div>
    </div>
  </div>
</Card>

<Card>
  <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
    {#each objectives as objective, j}
      <div class="flex flex-col border p-4">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="flex-wrap font-semibold"
              >{objective.name} {objective.minimize ? "(Min)" : "(Max)"}</span
            >
          </div>
          <span class="text-sm">{objective.name.substr(0, 3)}</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>Best: {$objectiveRanges.ideal[j]}</span>
          <span>Worst: {$objectiveRanges.nadir[j]}</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span>Step</span>
            <span>Best Reachible</span>
          </div>
          <span>Worst Reachible</span>
        </div>
        <div class="grid grid-cols-12 gap-2">
          {#each $iterationDetails as data, index}
            <!-- Replace with your actual step data -->
            <div class="col-span-1 text-center">{index + 1}</div>
            <div class="col-span-1 text-center">
              {Number.parseFloat(data.lowerBounds[j]).toFixed(2)}
            </div>
            <div class="col-span-9">
              <GDMNautilusBar
                reachableRanges={[data.lowerBounds[j], data.upperBounds[j]]}
                higherBound={$objectiveRanges.nadir[j]}
                lowerBound={$objectiveRanges.ideal[j]}
                currentValue={data.currentIterationPoint[j]}
                objIndex={index}
                iteration={1}
                arrowMode={false}
              />
            </div>
            <div class="col-span-1 text-center">
              {Number.parseFloat(data.upperBounds[j]).toFixed(2)}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</Card>
