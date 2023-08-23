<script lang="ts">
  // import Example from "$lib/components/visual/Example.svelte";
  // import HorizontalAxisPlot from "$lib/components/visual/HorizontalAxisPlot.svelte";
  import ParallelAxis from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotWithSwap.svelte";
  // import BarChartProps from "$lib/components/visual/visualization/props-linking/BarChart.svelte";
  // import PetalChartProps from "$lib/components/visual/visualization/props-linking/MultiplePetalCharts.svelte";
  // import RadarChart from "$lib/components/visual/RadarChart.svelte";
  // import PetalChart from "$lib/components/visual/PetalChart.svelte";
  import RadarChartProps from "$lib/components/visual/visualization/props-linking/RadarChart.svelte";
  // import BarChart from "$lib/components/visual/BarChart.svelte";
  // import { selectedSolutions } from "$lib/components/visual/stores";
  // import BasicTable from "$lib/components/visual/BasicTable.svelte";
  import type { SolutionData } from "$lib/components/visual/types";
  import SinglePetal from "$lib/components/visual/visualization/props-linking/PetalAsPie.svelte";

  // let data = [
  //   [12.99, 100, 82, "Good"],
  //   [9.99, 80, 77, "OK"],
  //   [20, 120, 60, "Excellent"],
  //   [22, 125, 20, "Excellent"],
  // ];

  // let names = ["Social", "Economic", "Environmental"];
  // let values = [
  //   [-1.4563, -0.89456, -2.6478],
  //   [-1.1653, -1.02342, -2.234],
  //   [-1.003, -0.73453, -2.0785],
  //   [-0.003, -0.453, -2.015],
  // ];

  // let dimensions = [
  //   { dim: 0, name: "grrr" },
  //   { dim: 1, name: "Net Weight" },
  //   { dim: 2, name: "Amount" },
  //   {
  //     dim: 3,
  //     name: "Score",
  //     type: "category",
  //     data: ["Excellent", "Good", "OK", "Bad"],
  //   },
  // ];
  let exampleData: SolutionData = {
    names: ["Objective1", "Objective2", "Objective3"],
    values: [
      [1, 2, 3, 2],
      [4, 5, 6, 2],
      [7, 8, 9, 4],
      [7, 2, 9, 8],
    ],
    value_ranges: [
      [0, 10],
      [0, 10],
      [0, 10],
    ],
    tags: [["Tag1", "Tag2"], ["Tag3"], ["Tag4", "Tag5", "Tag6"]],
    uncertainty: [
      [
        [0.9, 1.1],
        [1.9, 2.1],
        [2.9, 3.1],
      ],
      [
        [3.9, 4.1],
        [4.9, 5.1],
        [5.9, 6.1],
      ],
      [
        [6.9, 7.1],
        [7.9, 8.1],
        [8.9, 9.1],
      ],
    ],
    minimize: [true, false, true],
  };
  let theValues = exampleData.values;
  $: theValues;
  let selectedIndices: number[] = [];
  $: selectedIndices;
  let high: number | undefined = undefined;
  $: high;
  $: disableInteraction = false;
</script>

<div class="container">
  <div>
    <button
      style="background-color: lightgrey; border-style: double; border-color: black; padding: 5px; margin: 5px;"
      on:click={() => {
        theValues = [
          [1, 1, 1, 2],
          [4, 5, 6, 3],
          [7, 8, 9, 3],
        ];
        console.log(theValues);
      }}>Change values</button
    >
    <button
      style="background-color: lightgrey; border-style: double; border-color: black; padding: 5px; margin: 5px;"
      on:click={() => {
        selectedIndices = [0, 1];
        selectedIndices = selectedIndices;
      }}>Change selcted</button
    >
    <button
      style="background-color: lightgrey; border-style: double; border-color: black; padding: 5px; margin: 5px;"
      on:click={() => {
        selectedIndices = [];
        selectedIndices = selectedIndices;
      }}>Reset selections</button
    >
    <button
      style="background-color: lightgrey; border-style: double; border-color: black; padding: 5px; margin: 5px;"
      on:click={() => {
        disableInteraction = !disableInteraction;
      }}>Toggle interaction</button
    >

    <!-- <p>
      Current solutions:
      {#each $selectedSolutions as solution}
        <p>{solution.name}: {solution.value}</p>
      {/each}
    </p> -->
    <!-- <BasicTable selectedSolutions={$selectedSolutions} /> -->
    <!-- <ParallelAxis id="parallelAxis" {title} {names} {values} bind:solutions /> -->
  </div>
  <div style="height:50em; width:50vh; align-self: center;">
    <ParallelAxis
      bind:disableInteraction
      bind:values={theValues}
      names={["Objective1", "Objective2", "Objective3", "Objective4"]}
      lowerIsBetter={[true, false, true, false]}
      bind:selectedIndices
      bind:highlightedIndex={high}
      ranges={[
        { min: 0, max: 10 },
        { min: -2.324, max: 10 },
        { min: 0, max: 10 },
        { min: undefined, max: undefined },
      ]}
    />
  </div>
  <div style="height:50em; width:100vh">
    <RadarChartProps
      indicatorNames={["Objective1", "Objective2", "Objective3", "Objective4"]}
      bind:selectedIndices
      bind:values={theValues}
      bind:highlightedIndex={high}
    />
  </div>
  <div style="height:40em; width:100vh">
    <SinglePetal
      name={"Alternative 1"}
      bind:selectedIndices
      objectiveValues={[-1.1627, -1.3678, -1.8523, -1.1627]}
      bind:highlightedIndex={high}
      componentIndex={0}
    />
  </div>
  <!-- 
  <div style="height:30vh; width:100vh">
    <BarChartProps
      indicatorNames={["Objective1", "Objective2", "Objective3", "Objective4"]}
      bind:selectedIndices
      bind:values={theValues}
    />
  </div>
  <div style="height:30vh; width:100vh">
    <PetalChartProps
      indicatorNames={["Objective1", "Objective2", "Objective3", "Objective4"]}
      bind:selectedIndices
      bind:values={theValues}
      bind:highlightedIndices={high}
    />
  </div> -->
  <div>
    <!-- <HorizontalAxisPlot /> -->
    <!-- <RadarChart id="radarChart2" title="Radar chart" {names} {values} /> -->
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
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: nowrap;
  }
  div {
    min-height: 50px;
  }
</style>
