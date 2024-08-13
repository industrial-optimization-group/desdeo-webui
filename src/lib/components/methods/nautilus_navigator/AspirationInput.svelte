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

  // Number of decimal places to show
  export let decimals = 3;

  export let onChangeFunc: () => void;
</script>

<!-- The way of round is correct, even if it looks weird. -->
<div class="flex flex-row gap-4">
  <div class="w-4/6">
    <RangeSlider
      name={objective_name}
      min={+lower_bound.toFixed(decimals)}
      max={+upper_bound.toFixed(decimals)}
      bind:value={preference}
      step={+((upper_bound - lower_bound) / 1000).toFixed(decimals)}
      style="accent-color: {bar_color};"
      on:change={onChangeFunc}
    />
  </div>
  <div class="mr-1 w-2/6">
    <input
      type="number"
      min={+lower_bound.toFixed(decimals)}
      max={+upper_bound.toFixed(decimals)}
      bind:value={preference}
      width="10%"
      class="w-full"
      style="-webkit-appearance: none; -moz-appearance: textfield; appearance: textfield; text-align: center; background-color: {objective_color};"
      on:change={onChangeFunc}
    />
  </div>
</div>
