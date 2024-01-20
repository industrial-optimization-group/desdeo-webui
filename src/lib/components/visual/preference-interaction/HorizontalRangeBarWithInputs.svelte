<!-- 
  @component
  Uses HorizontalBar.svelte and BasicInput.svelte components to create a component with inputs and the horizontal bar.
 -->
<script lang="ts">
  import Input from "$lib/components/visual/preference-interaction/BasicInput.svelte";
  import SingleHorizontalBar from "$lib/components/visual/preference-interaction/HorizontalRangeBar.svelte";

  /** The lower bound of the chart. */
  export let lowerBound: number;

  /** The higher bound of the chart. */
  export let higherBound: number;

  /** The name to be shown on top of the component. */
  export let barName: string | undefined = undefined;

  /** The solution value to display on the chart. */
  export let solutionValue: number | undefined = undefined;

  /** The value that the user has selected */
  export let selectedMinValue: number | undefined = undefined;

  /** The value that the user has selected */
  export let selectedMaxValue: number | undefined = undefined;

  /** The previous value to display on the chart. */
  export let previousMinValue: number | undefined = undefined;

  /** The previous value to display on the chart. */
  export let previousMaxValue: number | undefined = undefined;

  /** Whether a lower value is better. */
  export let lowerIsBetter = true;

  /** The decimal precision to use for rounding values. */
  export let decimalPrecision: number | undefined = undefined;

  /** The color of the bar. */
  export let barColor: string | undefined = undefined;

  /**
   * Whether to display the arrow on the sides of the bar. Also restricts the
   * input values to the range of lower and higher bounds
   */
  export let arrowMode = false;

  /** The aspect ratio of the chart container div element. */
  export let aspect: string | undefined = undefined;

  //   export let barColor = "#a6b1e1";
  //   // export let isMin = true;
  //   // export let divId: string;
  //   export let inputs = false;

  function moveMinToRange() {
    if (arrowMode && selectedMinValue != null) {
      if (selectedMinValue < lowerBound) {
        selectedMinValue = lowerBound;
      } else if (selectedMinValue > higherBound) {
        selectedMinValue = higherBound;
      }
      selectedMinValue = selectedMinValue;
    }
  }

  function moveMaxToRange() {
    if (arrowMode && selectedMaxValue != null) {
      if (selectedMaxValue < lowerBound) {
        selectedMaxValue = lowerBound;
      } else if (selectedMaxValue > higherBound) {
        selectedMaxValue = higherBound;
      }
      selectedMaxValue = selectedMaxValue;
    }
  }
</script>

<!-- Horizontal bar with inputs -->
<!-- <div class="container" style="--barColor:{barColor ? barColor : '#c000'}"> -->
<div class="container {aspect}">
  <div
    class="firstPart"
    style="--justify: {barName ? 'space-between' : 'flex-end'}"
  >
    {#if barName}
      <span>{barName}</span>
    {/if}

    <Input
      bind:value={selectedMaxValue}
      labelName="Upper bound"
      onChange={moveMaxToRange}
    />
    <Input
      bind:value={selectedMinValue}
      labelName="Lower bound"
      onChange={moveMinToRange}
    />
    <!-- <div>
      <input type="number" bind:value={selectedValue} step="any" on:change={moveToRange}/>
    </div> -->
  </div>
  <div class="secondPart">
    <div id="prev">
      <!-- TODO: Implement this so that when no prev values is given, nothing shows up. But implementation should not make a mess. Maybe reserve a blank space (how)? -->
      <span style="color:gray; font-size: small; ">Previous preferences</span>
      {#if previousMinValue}
        <span id="prevValue">{previousMinValue}</span>
      {:else}
        <span id="prevValue">--</span>
      {/if}
      {#if previousMaxValue}
        <span id="prevValue">{previousMaxValue}</span>
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

    <SingleHorizontalBar
      {lowerBound}
      {higherBound}
      {solutionValue}
      bind:selectedMinValue
      bind:selectedMaxValue
      bind:previousMinValue
      bind:previousMaxValue
      {lowerIsBetter}
      {decimalPrecision}
      {barColor}
      {arrowMode}
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
    column-gap: 2em;
    border-style: solid;
    border-width: 2px;
    border-color: "c000";
    padding: 0.5em;
  }

  div div {
    /* margin: 0.5em; */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .firstPart {
    min-width: 20%;
    max-width: 20%;
    justify-content: var(--justify);
  }
  .secondPart {
    width: 100%;
    justify-content: space-between;
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
