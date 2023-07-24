<script lang="ts">
  import SingleHorizontalBar from "$lib/components/visual/SingleHorizontalBar.svelte";
  // import { onMount } from "svelte";

  $: selectedValue = 2;
  // let bar: SingleHorizontalBar;
  // $: selectedValue2 = 2;
  // let bar2: SingleHorizontalBar;
  // let chartDiv: HTMLDivElement
</script>

<!-- Horizontal bars with inputs -->
<div class="container">
  <!-- The size of this div willbe the size of the chart -->
  <div id="hori" style="width: 70vh; height: 2vh; min-height: 100px;">
    <!-- Note reference to the component itself -->
    <SingleHorizontalBar
      higherBound={5}
      lowerBound={0}
      solutionValue={3}
      previousValue={2.21398}
      inputs={true}
    />
  </div>
  <div id="hori2" style="width: 70vh; height: 2vh; min-height: 100px;">
    <!-- Note reference to the component itself -->
    <SingleHorizontalBar
      higherBound={10}
      lowerBound={-10}
      solutionValue={9}
      inputs={true}
    />
  </div>
  <!-- Horizontal bars without default inputs.   -->
  <div style="margin-top: 2em;">
    <input type="number" bind:value={selectedValue} />
    <div id="hori3" style="width: 70vh; height: 2vh; min-height: 100px;">
      <SingleHorizontalBar
        higherBound={5}
        lowerBound={0}
        solutionValue={3}
        bind:selectedValue
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
