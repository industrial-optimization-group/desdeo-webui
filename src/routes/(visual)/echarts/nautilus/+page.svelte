<script lang="ts">
  // import Example from "$lib/components/visual/Example.svelte";
  import NautilusNavigationBar from "$lib/components/visual/NautilusNavigationBar.svelte";
  import SingleNautilusNavigationBar from "$lib/components/visual/SingleNautilusNavigationBar.svelte";
  // import ParallelAxis from "$lib/components/visual/ParallelAxis.svelte";
  // import RadarChart from "$lib/components/visual/RadarChart.svelte";
  // import PetalChart from "$lib/components/visual/PetalChart.svelte";
  // import BarChart from "$lib/components/visual/BarChart.svelte";
  // import { selectedSolutions } from "$lib/components/visual/stores";
  import type { SolutionData } from "$lib/components/visual/types";
  // import BasicTable from "$lib/components/visual/BasicTable.svelte";

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
      [0, 5],
      [0, 10],
    ],
    tags: [["Tag1", "Tag2"], ["Tag3"], ["Tag4", "Tag5", "Tag6"]],
    uncertainty: [
      [
        [-5.932435235, 4.5234523452345],
        [-5.9, 3.1],
        [-5.5, 3.1],
        [-4.9, 2.1],
        [-2.3, 1.3],
        [-1.9, 1.1],
        [-0.9252345452, 0.14524535235345],
      ],
      [
        [0, 13],
        [1, 12.5],
        [1, 11],
        [2, 6],
        [2, 6],
        [4, 6],
        [5.5, 6],
      ],
      [
        [5.9, 4.1],
        [5.9, 3.1],
        [5.5, 3.1],
        [4.9, 2.1],
        [2.3, 1.3],
        [1.9, 1.1],
        [0.9, 0.1],
      ],
    ],
    minimize: [true, false, true],
  };
</script>

<!-- Single Nautilus bars -->
<div id="hori" style="width: 70vh; height: 2vh; min-height: 100px;">
  <SingleNautilusNavigationBar
    higherBound={5}
    lowerBound={0}
    iterations={10}
    currentIterationIndex={2}
    uncertaintyBounds={exampleData.uncertainty[0]}
  />
</div>
<div class="container">
  <div>
    <NautilusNavigationBar id="nautilus" data={exampleData} />
  </div>
</div>
<!-- <div>
  <Example></Example>
</div> -->
<!-- <style>
  /* A scrollable div where height is the height of the screen*/

  .container {
    height: 100vh;
    min-width: max-content;
    overflow: scroll;
  }
</style> -->
