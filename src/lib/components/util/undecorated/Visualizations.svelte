<script lang="ts" context="module">
  export type Point = number[];
  export type Mode = "tabbed" | "gridded";
</script>

<script lang="ts">
  import TabbedVisualizations from "./TabbedVisualizations.svelte";
  import GriddedVisualizations from "./GriddedVisualizations.svelte";

  export let names: string[] | undefined = undefined;
  export let values: Point[];
  export let bounds: { min: number; max: number }[];
  export let lower_is_better: boolean[];
  export let selected: number[] = [];
  export let max_selections: number | undefined = undefined;
  export let highlighted: number | undefined = undefined;
  export let disabled = false;
  export let mode: Mode = "tabbed";

  //
  // NOTE: The user of the component is responsible for verifying that `names`,
  // `values`, `bounds` and `lower_is_better` have the same length.
  //
</script>

{#if mode === "tabbed"}
  <TabbedVisualizations
    {names}
    {values}
    {bounds}
    {lower_is_better}
    bind:selected
    {max_selections}
    bind:highlighted
    {disabled}
  />
{:else if mode === "gridded"}
  <GriddedVisualizations
    {names}
    {values}
    {bounds}
    {lower_is_better}
    bind:selected
    {max_selections}
    bind:highlighted
    {disabled}
  />
{/if}
