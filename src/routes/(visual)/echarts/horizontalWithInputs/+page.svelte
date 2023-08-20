<script lang="ts">
  import HorizontalBarWithInputs from "$lib/components/visual/preference-interaction/HorizontalBarWithInputs.svelte";

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

<div style="width: 75vw; height: 20vh;">
  <HorizontalBarWithInputs
    higherBound={-0.5}
    lowerBound={-5.5234}
    barName="name"
    {previousValue}
    solutionValue={-2.21398}
    bind:selectedValue
  />
</div>
<div style="width: 75vw; height: 20vh;">
  <HorizontalBarWithInputs
    higherBound={5}
    lowerBound={0}
    bind:previousValue
    bind:solutionValue
    bind:selectedValue
  />
</div>
<div style="width: 75vw; height: 20vh;">
  <HorizontalBarWithInputs
    higherBound={5.4355}
    lowerBound={5.5234}
    bind:previousValue
    bind:solutionValue
    bind:selectedValue
  />
</div>
<div style="width: 75vw; height: 20vh;">
  <HorizontalBarWithInputs
    higherBound={5}
    lowerBound={-5.5234}
    barName="name"
    {previousValue}
    bind:solutionValue
    bind:selectedValue
  />
</div>
<button
  on:click={() => {
    previousValue = 2.21398;
  }}>Change prev</button
>
