<!-- 
  @component
  Uses NimbusBar.svelte component to create a classification component with inputs and the horizontal bar.
 -->

<script lang="ts">
  import NimbusBar from "$lib/components/visual/preference-interaction/NIMBUSBar.svelte";
  import { colorPalette } from "$lib/components/visual/constants";

  /** The names of the objectives. */
  export let objective_names: string[];

  /**
   * Boolean to check if the objective is maximized or minimized. Must be the
   * same length as objective_names.
   */
  export let is_maximized: boolean[];

  /** The lower bound of the chart. Must be the same length as objective_names. */
  export let lower_bounds: number[];

  /** The higher bound of the chart. Must be the same length as objective_names. */
  export let upper_bounds: number[];

  /**
   * The solution value to display on the chart. Must be the same length as
   * objective_names.
   */
  export let solutionValue: number[];

  /**
   * The previous preference value to display on the chart. Must be the same
   * length as objective_names.
   */
  export let previousValue: number[];

  /**
   * The value that the user has selected. Must be the same length as
   * objective_names.
   */
  export let preference: (number | undefined)[];

  $: preference = [...preference];

  /** The decimal precision to use for rounding values. */
  export let decimalPrecision = 3;

  // Extract the right number of colors from the color palette.
  let colors = colorPalette.slice(0, objective_names.length);
</script>

<div class="flex flex-col gap-4">
  {#each objective_names as objective_name, j}
    <NimbusBar
      barName={objective_name}
      lowerBound={lower_bounds[j]}
      higherBound={upper_bounds[j]}
      previousValue={previousValue[j]}
      solutionValue={solutionValue[j]}
      barColor={colors[j]}
      bind:selectedValue={preference[j]}
      {decimalPrecision}
      lowerIsBetter={!is_maximized[j]}
      arrowMode={true}
    />
  {/each}
</div>
