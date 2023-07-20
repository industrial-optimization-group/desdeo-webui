<script lang="ts">
  import SingleHorizontalBar from "$lib/components/visual/SingleHorizontalBar.svelte";
  // import { onMount } from "svelte";

  $: selectedValue = 2;
  let bar: SingleHorizontalBar;
  $: selectedValue2 = 2;
  let bar2: SingleHorizontalBar;
  // let chartDiv: HTMLDivElement
</script>

<!-- Horizontal bars with inputs -->
<div class="container">
  <!-- The size of this div willbe the size of the chart -->
  <div id="hori" style="width: 70vh; height: 2vh; min-height: 100px;">
    <!-- Note reference to the component itself -->
    <SingleHorizontalBar
      bind:this={bar}
      higherBound={5}
      lowerBound={0}
      solutionValue={3}
      inputs={true}
    />
  </div>
  <div id="hori2" style="width: 70vh; height: 2vh; min-height: 100px;">
    <!-- Note reference to the component itself -->
    <SingleHorizontalBar
      bind:this={bar}
      higherBound={10}
      lowerBound={-10}
      solutionValue={3}
      inputs={true}
    />
  </div>
  <!-- Horizontal bars without default inputs.   -->
  <!-- Note the calling the updateSelected method -->
  <div style="margin-top: 2em;">
    <input
      type="number"
      bind:value={selectedValue}
      on:change={() => bar.updateSelected()}
    />
    <div id="hori3" style="width: 70vh; height: 2vh; min-height: 100px;">
      <SingleHorizontalBar
        bind:this={bar}
        higherBound={5}
        lowerBound={0}
        solutionValue={3}
        bind:selectedValue
      />
    </div>
  </div>
  <div style="margin-top: 2em;">
    <input
      type="number"
      bind:value={selectedValue2}
      on:change={() => bar2.updateSelected()}
    />
    <div id="hori3" style="width: 70vh; height: 2vh; min-height: 100px;">
      <SingleHorizontalBar
        bind:this={bar2}
        higherBound={5}
        lowerBound={0}
        solutionValue={3}
        bind:selectedValue={selectedValue2}
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
