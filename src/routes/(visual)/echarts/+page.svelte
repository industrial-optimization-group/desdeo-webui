<script lang="ts">
  // import Example from "$lib/components/visual/Example.svelte";
  import HorizontalAxisPlot from "$lib/components/visual/HorizontalAxisPlot.svelte";
  import ParallelAxis from "$lib/components/visual/ParallelAxis.svelte";
  import RadarChart from "$lib/components/visual/RadarChart.svelte";
  import PetalChart from "$lib/components/visual/PetalChart.svelte";
  import BarChart from "$lib/components/visual/BarChart.svelte";
  import { selectedSolutions } from "$lib/components/visual/stores";
  import type { SolutionData } from "$lib/components/visual/types";
  import BasicTable from "$lib/components/visual/BasicTable.svelte";

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
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
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
</script>

<div class="container">
  <div>
    <p>
      Current solutions:
      {#each $selectedSolutions as solution}
        <p>{solution.name}: {solution.value}</p>
      {/each}
    </p>
    <BasicTable selectedSolutions={$selectedSolutions} />
    <!-- <ParallelAxis id="parallelAxis" {title} {names} {values} bind:solutions /> -->
    <ParallelAxis
      id="parallelAxis"
      title="Parallel Axis chart"
      data={exampleData}
    />
  </div>
  <div>
    <BarChart id="barChart" title="Bar chart" data={exampleData} />
    <PetalChart id="petalChart" title="Petal chart" data={exampleData} />
  </div>
  <div>
    <RadarChart id="radarChart" title="Radar Chart" data={exampleData} />
  </div>
  <div>
    <HorizontalAxisPlot data={exampleData} />
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
