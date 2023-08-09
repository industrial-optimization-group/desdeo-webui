<script lang="ts">
  import InputWithValidation from "$lib/components/visual/InputWithValidation.svelte";
  import { onMount } from "svelte";
  import SingleHorizontalBar from "./SingleHorizontalBar.svelte";

  export let lowerBound: number;
  export let higherBound: number;
  export let objectiveName = "Some objective";
  export let solutionValue: number | undefined = undefined;
  export let selectedValue: number | undefined = undefined;
  export let previousValue: number | undefined = undefined;
  //   export let barColor = "#a6b1e1";
  //   // export let isMin = true;
  //   // export let divId: string;
  //   export let inputs = false;
  //   export let decimalPrecision = 2;

  onMount(() => {
    // if (previousValue) {
    //   console.log(previousValue);
    //   // document.getElementById("prev")?.removeAttribute("style");
    //   document.getElementById("prev").style.display = "flex";
    // } else {
    //   document.getElementById("prev").style.display = "none";
    // }
  });
</script>

<!-- Horizontal bar with inputs -->
<div class="container">
  <div class="firstPart">
    <span>{objectiveName}</span>
    <InputWithValidation
      bind:value={selectedValue}
      labelName="Aspiration level"
      {higherBound}
      {lowerBound}
    />
  </div>
  <div class="secondPart">
    <div id="prev">
      <span style="color:gray; font-size: small; ">Previous preference</span>
      <InputWithValidation
        bind:value={previousValue}
        {higherBound}
        {lowerBound}
        readonly={true}
      />
    </div>
    <SingleHorizontalBar
      {lowerBound}
      {higherBound}
      {solutionValue}
      bind:selectedValue
      bind:previousValue
    />
  </div>
</div>

<style>
  /* A scrollable div where height is the height of the screen*/

  .container {
    display: flex;
    /* width: fit-content; */
    /* min-width: max-content; */
    /* justify-content: space-between; */
    height: 100%;
    width: 100%;
  }

  div div {
    margin: 0.5em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .firstPart {
    width: 20%;
  }
  .secondPart {
    row-gap: 0.5em;
    height: 100%;
    width: 100%;
  }

  #prev {
    display: flex;
    flex-direction: row;
    justify-content: right;
    margin: 0;
    padding-bottom: 0;
  }
</style>
