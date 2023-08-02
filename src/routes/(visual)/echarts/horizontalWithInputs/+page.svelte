<script lang="ts">
  import HorizontalBarWithInputs from "$lib/components/visual/HorizontalBarWithInputs.svelte";

  // import { onMount } from "svelte";
  let solutionValue: number;
  $: solutionValue = 3.23;
  $: selectedValue = undefined;
  let previousValue: number | undefined = undefined;
  $: previousValue = 2.213;
  // let bar: SingleHorizontalBar;
  // $: selectedValue2 = 2;
  // let bar2: SingleHorizontalBar;
  // let chartDiv: HTMLDivElement
</script>

<div style="width: 75vw; height: 20vh;">
  <HorizontalBarWithInputs
    higherBound={5}
    lowerBound={0}
    objectiveName="Objective 1 "
    bind:previousValue
    bind:solutionValue
    bind:selectedValue
  />
</div>
<!-- <button
  on:click={() => {
    previousValue = 2.21398;
  }}>Change prev</button
> -->
