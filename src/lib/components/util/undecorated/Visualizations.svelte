<!--
@component
A component for showing visualizations in tabs or a grid.

NOTE: The user of the component is responsible for verifying that `names`,
`values`, `lower_bounds`, `upper_bounds` and `lower_is_better` have the same
length.
-->
<script lang="ts" context="module">
  export type Point = number[];
</script>

<script lang="ts">
  import TabbedVisualizations from "./TabbedVisualizations.svelte";
  import GriddedVisualizations from "./GriddedVisualizations.svelte";

  export let names: string[] | undefined = undefined;
  export let values: Point[];
  export let lower_bounds: number[];
  export let upper_bounds: number[];
  export let lower_is_better: boolean[];
  export let selected: number[] = [];
  export let max_selections: number | undefined = undefined;
  export let highlighted: number | undefined = undefined;
  export let disabled = false;
  export let grid_mode = false;
</script>

{#if grid_mode}
  <GriddedVisualizations
    {names}
    {values}
    {lower_bounds}
    {upper_bounds}
    {lower_is_better}
    bind:selected
    {max_selections}
    bind:highlighted
    {disabled}
  />
{:else}
  <TabbedVisualizations
    {names}
    {values}
    {lower_bounds}
    {upper_bounds}
    {lower_is_better}
    bind:selected
    {max_selections}
    bind:highlighted
    {disabled}
  />
{/if}
