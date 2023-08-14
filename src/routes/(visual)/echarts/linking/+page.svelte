<script lang="ts">
  // import Example from "$lib/components/visual/Example.svelte";
  // import HorizontalAxisPlot from "$lib/components/visual/HorizontalAxisPlot.svelte";
  import ParallelAxis from "$lib/components/visual/ParallelAxis.svelte";
  // import RadarChart from "$lib/components/visual/RadarChart.svelte";
  // import PetalChart from "$lib/components/visual/PetalChart.svelte";
  import RadarChartProps from "$lib/components/visual/newComponents/RadarChartProps.svelte";
  // import BarChart from "$lib/components/visual/BarChart.svelte";
  // import { selectedSolutions } from "$lib/components/visual/stores";
  // import BasicTable from "$lib/components/visual/BasicTable.svelte";
  import type { SolutionData } from "$lib/components/visual/types";

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
    <!-- <p>
      Current solutions:
      {#each $selectedSolutions as solution}
        <p>{solution.name}: {solution.value}</p>
      {/each}
    </p> -->
    <!-- <BasicTable selectedSolutions={$selectedSolutions} /> -->
    <!-- <ParallelAxis id="parallelAxis" {title} {names} {values} bind:solutions /> -->
    <div style="height:40vh; width:100vh">
      <ParallelAxis
        bind:values={theValues}
        minimize={[true, false, true, false]}
        bind:selectedIndices
        ranges={[
          { min: 0, max: 10 },
          { min: -2.324, max: 10 },
          { min: 0, max: 10 },
          { min: undefined, max: undefined },
        ]}
      />
    </div>
  </div>

  <div>
    <RadarChartProps
      indicatorNames={["Objective1", "Objective2", "Objective3", "Objective4"]}
      bind:selectedIndices
      bind:values={theValues}
    />
  </div>

  <!-- <div> 
    <BarChart id="barChart" title="Bar chart" data={exampleData} />
    <PetalChart id="petalChart" title="Petal chart" data={exampleData} />
  </div>
  <div>
    <RadarChart id="radarChart" title="Radar Chart" data={exampleData} />
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
  }
</style>
