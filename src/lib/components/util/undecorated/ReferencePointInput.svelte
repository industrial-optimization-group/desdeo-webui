<!--
@component 
A simple component for inputting preference information as a reference point.
Intended for testing use only.
-->
<script lang="ts">
  import type { Objective } from "$lib/api";

  /** @readonly */
  export let objectives: Objective[];

  /**
   * Output variable for the inputted value. Must have the same length as
   * `objectives`.
   */
  export let reference_point: unknown[];

  if (reference_point.length !== objectives.length) {
    throw new TypeError("Reference point has invalid length");
  }
</script>

<div class="flex flex-col gap-4">
  {#each objectives as { name, minimize }, j}
    <div class="flex flex-col gap-2">
      <div>
        {name} (<span class="font-bold"
          >{minimize ? "minimize" : "maximize"}</span
        >)
      </div>
      <input
        type="number"
        class="input max-w-xs"
        bind:value={reference_point[j]}
      />
    </div>
  {/each}
</div>
