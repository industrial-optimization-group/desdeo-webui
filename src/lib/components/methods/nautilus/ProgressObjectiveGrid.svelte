<script lang="ts">
  import Card from "$lib/components/main/Card.svelte";
  import GDMNautilusBar from "$lib/components/visual/preference-interaction/GDMNautilusBar.svelte";
  import { iterationDetails, stepsTaken, inputIterations } from "./stores";
  import Button from "./Button.svelte";
  import { writable } from "svelte/store";
  import Tooltip from "$lib/components/util/Tooltip.svelte";
  import InfoIcon from "~icons/heroicons/information-circle";

  export let objectives;
  export let objectiveRanges: { ideal: number[]; nadir: number[] };
  export let distance: number;

  let unit = "UNIT";

  $: progressPercentage = distance;

  $: if ($iterationDetails.length > 3) {
    visibleStartIndex.set($iterationDetails.length - 3);
  } else {
    visibleStartIndex.set(0);
  }

  let visibleStartIndex = writable(0);
  // Function to scroll forward
  function scrollForward() {
    visibleStartIndex.update((index) => {
      const maxIndex = $iterationDetails.length - 3;
      return index + 1 < maxIndex ? index + 1 : maxIndex;
    });
  }
  // Function to scroll backward
  function scrollBackward() {
    visibleStartIndex.update((index) => {
      if (index > 0) {
        return index - 1;
      } else {
        return 0;
      }
    });
  }
</script>

<div class={"rounded-md bg-white p-2 "}>
  <div class={"flex"}>
    <div class="w-96">
      <div class="flex items-center">
        <h2 class="text-lg font-semibold">Reachable Values</h2>
        <Tooltip title="This is a helpful tooltip for reachable values grid."
          ><InfoIcon class="ml-2 h-6 w-6 text-blue-500" /></Tooltip
        >
      </div>
      <div>
        <p class="text-sm font-light">
          Step {$stepsTaken} of {$inputIterations.iterations}
        </p>
      </div>
    </div>

    <div class={"w-full"}>
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

  <div class="grid grid-cols-1 gap-1 p-1 text-sm md:grid-cols-2">
    {#each objectives as objective, j}
      <div class="flex flex-col rounded-md border p-1">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="font-semibold">
              {objective.name}
              {objective.minimize ? "(Min)" : "(Max)"}, {unit}
            </span>
          </div>
          <div>
            <span class="text-sm">{objective.name.substr(0, 3)}</span>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <span>Best: {objectiveRanges.ideal[j]}</span>
          <span>Worst: {objectiveRanges.nadir[j]}</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-end space-x-4">
            <span>Step</span>
            <div>
              <div>Best</div>
              <div>Reachible</div>
            </div>
          </div>
          <div>
            <div>Worst</div>
            <div>Reachible</div>
          </div>
        </div>
        <div class="grid w-[580px] grid-cols-12">
          {#each $iterationDetails.slice($visibleStartIndex, $visibleStartIndex + 3) as data, index (index)}
            <div class="col-span-1 pl-2">
              <div class="py-4">{index + 1 + $visibleStartIndex}</div>
            </div>
            <div class="col-span-1 pl-2">
              <div class="py-4">
                {Number.parseFloat(data.lowerBounds[j]).toFixed(2)}
              </div>
            </div>
            <div class="col-span-9">
              <GDMNautilusBar
                reachableRanges={[data.lowerBounds[j], data.upperBounds[j]]}
                higherBound={objectiveRanges.nadir[j]}
                lowerBound={objectiveRanges.ideal[j]}
                currentValue={data.currentIterationPoint[j]}
                objIndex={index}
                iteration={1}
                arrowMode={false}
                aspect={"aspect-[7]"}
              />
            </div>
            <div class="col-span-1 py-4 pr-3">
              {Number.parseFloat(data.upperBounds[j]).toFixed(2)}
            </div>
          {/each}
          <div class="col-span-12 flex justify-between">
            <Button
              disabled={$visibleStartIndex === 0}
              text="<"
              on:click={() => scrollBackward()}
            />
            <Button
              disabled={$visibleStartIndex + 3 >= $iterationDetails.length}
              text=">"
              on:click={() => scrollForward()}
            />
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
