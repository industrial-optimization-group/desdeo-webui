<script lang="ts">
  // import Example from "$lib/components/visual/Example.svelte";
  import HorizontalAxisPlot from "$lib/components/visual/HorizontalAxisPlot.svelte";
  import ParallelAxis from "$lib/components/visual/ParallelAxis.svelte";
  import RadarChart from "$lib/components/visual/RadarChart.svelte";

  // let data = [
  //   [12.99, 100, 82, "Good"],
  //   [9.99, 80, 77, "OK"],
  //   [20, 120, 60, "Excellent"],
  //   [22, 125, 20, "Excellent"],
  // ];

  let names = ["Social", "Economic", "Environmental"];
  let values = [
    [-1.4563, -0.89456, -2.6478],
    [-1.1653, -1.02342, -2.234],
    [-1.003, -0.73453, -2.0785],
    [-0.003, -0.453, -2.015],
  ];

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
  let title = "test Title";
  let solutions: number[][] = [];
</script>

<div>
  <p>
    Current solutions:
    {#each solutions as solution}
      <p>{solution}</p>
    {/each}
  </p>
  <ParallelAxis id="parallelAxis" {title} {names} {values} bind:solutions />
</div>
<div>
  <RadarChart id="radarChart" {names} {values} />
</div>
<div>
  <HorizontalAxisPlot />
  <RadarChart id="radarChart2" {names} {values} />
</div>

<!-- <div>
  <Example></Example>
</div> -->
