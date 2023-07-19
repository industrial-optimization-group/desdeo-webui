<script lang="ts">
  import SingleHorizontalBar from "$lib/components/visual/SingleHorizontalBar.svelte";
  // import { onMount } from "svelte";

  $: selectedValue = 3;
  let bar: SingleHorizontalBar;
  // let chartDiv: HTMLDivElement
</script>

<div class="container">
  <!-- Note the calling the updateSelected method -->
  <input
    type="number"
    bind:value={selectedValue}
    on:change={() => bar.updateSelected()}
  />
  <!-- The size of this div willbe the size of the chart -->
  <div id="hori" style="width: 70vh; height: 2vh; min-height: 100px;">
    <!-- Note reference to the component itself -->
    <SingleHorizontalBar
      divId="hori"
      bind:this={bar}
      higherBound={5}
      lowerBound={0}
      bind:selectedValue
    />
  </div>
  <!-- <div id="hori2" style="width: 70vh; height: 2vh; min-height: 100px;">
    <SingleHorizontalBar divId="hori2" bind:this={bar} higherBound={5} lowerBound={0} bind:selectedValue = {selectedValue} ></SingleHorizontalBar>
  </div> -->
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
