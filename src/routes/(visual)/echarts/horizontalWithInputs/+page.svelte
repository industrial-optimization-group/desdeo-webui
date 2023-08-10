<script lang="ts">
  import HorizontalBarWithInputs from "$lib/components/visual/HorizontalBarWithInputs.svelte";

  // import { onMount } from "svelte";
  let solutionValue: number;
  $: solutionValue = 3.23;
  $: selectedValue = undefined;
  let previousValue: number | undefined = undefined;
  $: previousValue;
  // let bar: SingleHorizontalBar;
  // $: selectedValue2 = 2;
  // let bar2: SingleHorizontalBar;
  // let chartDiv: HTMLDivElement
</script>

<div style="width: 50vw; height: 50vh;">
  <HorizontalBarWithInputs
    higherBound={5}
    lowerBound={0}
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
