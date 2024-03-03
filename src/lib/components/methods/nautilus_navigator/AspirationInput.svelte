<!--
@component
A user interface for getting aspiration level for an objective in the NAUTILUS Navigator method.
Shows the objective name and the unit of the objective. The user can use a slider or an 
input field to set the aspiration level.
-->
<script lang="ts">
  import { RangeSlider } from "@skeletonlabs/skeleton";

  // The name of the objective. Preferably short.
  export let objective_name: string;

  // The lower bound of the objective.
  export let lower_bound: number;

  // The upper bound of the objective.
  export let upper_bound: number;

  // The current preference value.
  export let preference: number;

  // Color of the objective
  export let objective_color = "blue";

  // color of the bar
  export let bar_color = "black";

  export let onChangeFunc: () => void;
</script>

<div class="flex flex-row gap-4">
  <div class="w-4/6">
    <RangeSlider
      name={objective_name}
      min={lower_bound}
      max={upper_bound}
      bind:value={preference}
      step={(upper_bound - lower_bound) / 100}
      style="accent-color: {bar_color};"
      on:change={onChangeFunc}
    />
  </div>
  <div class="mr-1 w-2/6">
    <input
      type="number"
      min={lower_bound}
      max={upper_bound}
      bind:value={preference}
      width="10%"
      class="w-full"
      style="-webkit-appearance: none; -moz-appearance: textfield; appearance: textfield; text-align: center; background-color: {objective_color};"
      on:change={onChangeFunc}
    />
  </div>
</div>
