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

<div style="display: flex; height: 80vh; overflow-x:scroll;">
  <div>
    <p>Higher is better</p>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={-0.5}
        lowerBound={-5.5234}
        barName="name"
        {previousValue}
        solutionValue={-2.21398}
        bind:selectedValue
        lowerIsBetter={false}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5}
        lowerBound={0}
        bind:previousValue
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={false}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5.4355}
        lowerBound={5.5234}
        bind:previousValue
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={false}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5}
        lowerBound={-5.5234}
        barName="name"
        {previousValue}
        solutionValue={2.21398}
        bind:selectedValue
        lowerIsBetter={false}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5}
        lowerBound={-5.5234}
        barName="name"
        {previousValue}
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={false}
      />
    </div>
  </div>
  <div>
    <p>lower is better</p>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={-0.5}
        lowerBound={-5.5234}
        barName="name"
        {previousValue}
        solutionValue={-2.21398}
        bind:selectedValue
        lowerIsBetter={true}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5}
        lowerBound={0}
        bind:previousValue
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={true}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5.4355}
        lowerBound={5.5234}
        bind:previousValue
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={true}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5}
        lowerBound={-5.5234}
        barName="name"
        {previousValue}
        solutionValue={-2.21398}
        bind:selectedValue
        lowerIsBetter={true}
      />
    </div>
    <div style="width: 50vw; height: 20vh;">
      <HorizontalBarWithInputs
        higherBound={5}
        lowerBound={-5.5234}
        barName="name"
        {previousValue}
        bind:solutionValue
        bind:selectedValue
        lowerIsBetter={true}
      />
    </div>
  </div>
</div>
<button
  on:click={() => {
    solutionValue = -2.21398;
  }}>Change to neg</button
>
<button
  on:click={() => {
    solutionValue = 2.21398;
  }}>Change to pos</button
>
