<script lang="ts">
  import InputWithValidation from "$lib/components/visual/preference-interaction/BasicInput.svelte";
  import { onMount } from "svelte";
  import SingleHorizontalBar from "$lib/components/visual/preference-interaction/HorizontalBar.svelte";

  export let lowerBound: number;
  export let higherBound: number;
  export let barName: string | undefined = undefined;
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
  <div
    class="firstPart"
    style="--justify: {barName ? 'space-between' : 'flex-end'}"
  >
    {#if barName}
      <span>{barName}</span>
    {/if}

    <InputWithValidation
      bind:value={selectedValue}
      labelName="Aspiration level"
    />
  </div>
  <div class="secondPart">
    <div id="prev">
      <!-- TODO: Implement this so that when no prev values is given, nothing shows up. But implementation should not make a mess. Maybe reserve a blank space (how)? -->
      <span style="color:gray; font-size: small; ">Previous preference</span>
      {#if previousValue}
        <span id="prevValue">{previousValue}</span>
      {:else}
        <span id="prevValue">--</span>
      {/if}
      <!-- <InputWithValidation
        bind:value={previousValue}
        {higherBound}
        {lowerBound}
        readonly={true}
      /> -->
    </div>
    <div style="width: 100%; height: 90%;">
      <SingleHorizontalBar
        {lowerBound}
        {higherBound}
        {solutionValue}
        bind:selectedValue
        bind:previousValue
      />
    </div>
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
    column-gap: 2em;
    border-style: solid;
    border-width: 2px;
    border-color: #ccc;
    padding: 0.5em;
  }

  div div {
    /* margin: 0.5em; */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .firstPart {
    width: 20%;
    justify-content: var(--justify);
  }
  .secondPart {
    width: 100%;
  }

  #prev {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin: 0;
    padding-bottom: 0;
  }

  #prevValue {
    margin-left: 0.5em;
    align-self: center;
    font-size: small;
    color: gray;
    font-weight: 600;
  }
</style>
