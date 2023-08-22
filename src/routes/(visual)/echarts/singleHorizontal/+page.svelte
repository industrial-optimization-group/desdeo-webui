<script lang="ts">
  import HorizontalBarWithArrows from "$lib/components/visual/preference-interaction/HorizontalBarWithArrows.svelte";
  // import HorizontalBar from "$lib/components/visual/preference-interaction/HorizontalBar.svelte";
  import HorizontalBarWithInputs from "$lib/components/visual/preference-interaction/HorizontalBarWithInputs.svelte";

  // import { onMount } from "svelte";
  let solutionValue: number;
  $: solutionValue = -2;
  $: selectedValue = 2;
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
    />
  </div>
  <div
    id="hori"
    style="width: 60vh; height: 2vh; min-height: 70px; margin-top: 2m; margin-bottom: 5em;"
  >
    <HorizontalBarWithArrows
      higherBound={5}
      lowerBound={0}
      solutionValue={3}
      previousValue={2.21398}
    />
  </div>
  <div id="hori2" style="width: 100vh; height: 2vh; min-height: 100px;">
    <HorizontalBarWithArrows
      higherBound={-10.234523}
      lowerBound={-11.53453}
      previousValue={-11.05}
      solutionValue={-11.05}
    />
  </div>
  <div
    id="hori3"
    style="margin: 2em; width: 30vh; height: 2vh; min-height: 100px;"
  >
    <HorizontalBarWithArrows
      higherBound={10}
      lowerBound={-10}
      solutionValue={-3}
    />
  </div>
  <!-- Horizontal bars without default inputs.   -->
  <div style="margin-top: 2em;">
    <input type="number" bind:value={selectedValue} />
    <input type="number" bind:value={solutionValue} />
    <div id="hori3" style="width: 70vh; height: 2vh; min-height: 100px;">
      <HorizontalBarWithArrows
        higherBound={5}
        lowerBound={-5}
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={false}
      />
    </div>
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
