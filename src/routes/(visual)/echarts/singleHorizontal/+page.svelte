<script lang="ts">
  import HorizontalBar from "$lib/components/visual/preference-interaction/HorizontalBar.svelte";
  // import HorizontalBar from "$lib/components/visual/preference-interaction/HorizontalBar.svelte";
  import HorizontalBarWithInputs from "$lib/components/visual/preference-interaction/HorizontalBarWithInputs.svelte";

  // import { onMount } from "svelte";
  // let solutionValue: number;
  // $: solutionValue = -2;
  // $: selectedValue = 2;
  // let bar: HorizontalBar;
  // $: selectedValue2 = 2;
  // let bar2: HorizontalBar;
  // let chartDiv: HTMLDivElement
</script>

<!-- Horizontal bars with inputs -->
<div class="container">
  <!-- The size of this div willbe the size of the chart -->
  <div style="width: 50vw; height: 15vh;">
    <HorizontalBarWithInputs
      higherBound={5}
      lowerBound={0}
      solutionValue={3}
      previousValue={2.21398}
      barName="Solution 1"
      arrowMode={true}
    />
  </div>
  <div
    id="hori"
    style="width: 60vh; height: 2vh; min-height: 70px; margin-top: 2m; margin-bottom: 5em;"
  >
    <HorizontalBar
      higherBound={5}
      lowerBound={0}
      solutionValue={3}
      previousValue={2.21398}
      arrowMode={true}
    />
  </div>
</div>

<!-- <div>
  <Example></Example>
</div> -->
<style>
  /* A scrollable div where height is the height of the screen*/

  .container {
    height: 100vh;
    min-width: max-content;
    overflow: scroll;
  }
</style>
