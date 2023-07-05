<!--@component
    @description This is a template for a component that uses ECharts. It is not meant to be used directly.
-->

<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  import { createChart } from "./stores";
  import type { SolutionData } from "./types";
  // import { element } from "svelte/internal";

  // The properties that can be passed to the component.
  export let id: string;
  export let data: SolutionData;
  console.log(data);

  const upperBounds = [
    [10, 9, 7, 5, 5, 5], // objective 1
    [2.0, 1.9, 1.5, 0.8, 0.6, 0.6], // objective 2
    [5, 4.5, 4, 3, 2.8, 2.8], // objective 3
  ];
  const lowerBounds = [
    [0, 0.2, 0.3, 0.5, 1.5, 1.5], // objective 1
    [0.0, 0.05, 0.1, 0.15, 0.2, 0.2], // objective 2
    [-5, -4, -3, 0.2, 0.5, 0.5], // objective 3
  ];
  let firstPart = upperBounds[0];
  let secondPart: Array<number> = lowerBounds[0];
  //reverse secondPart
  let reversed = secondPart.slice();

  let shapeData = [];
  // for (let i = 0; i < upperBounds.length; i++) {
  //   shapeData.push([i,upperBounds]);
  // }

  firstPart.map((value, index) => {
    shapeData.push([index, value]);
  });
  for (let i = reversed.length; i >= 0; i--) {
    const point = reversed[i];
    shapeData.push([i, point]);
  }

  // The chart will be created when the component is mounted. This is done to ensure that the div element exists.
  onMount(() => {
    // Create the option object for the whole chart. This example creates a basic bar chart.
    const option: echarts.EChartOption = {
      xAxis: {},
      yAxis: {},
      series: [
        {
          type: "custom",
          renderItem: draw,
          clip: true,
          data: shapeData,
        },
      ],
    };
    createChart(id, option);
    function draw(
      params,
      api
    ): echarts.EChartOption.SeriesCustom.RenderItemReturnPolygon {
      if (params.context.rendered) {
        return;
      }
      params.context.rendered = true;
      let points = [];
      for (let i = 0; i < shapeData.length; i++) {
        points.push(api.coord(shapeData[i]));
      }
      let color = api.visual("color");
      return {
        type: "polygon",
        transition: ["shape"],
        shape: {
          points: points,
        },
        style: api.style({
          fill: color,
          stroke: echarts.color.lift(color, 0.1),
        }),
      };
    }
    //Other way to draw polygon:
    // shapeData.forEach((pair, index) => {
    //   let valueInGrid = chart.convertToPixel({ seriesIndex: 0 }, [index, pair[1]]);
    //   pair[1]= valueInGrid[1]
    // });
    // let testPolygon = {
    //   name: "test",
    //   type: "polygon",
    //   shape: {
    //     points: shapeData,
    //   },
    //   color: "red",
    // };
    // chart.setOption({
    //   graphic: [testPolygon]
    // });
    console.log("object");
    /* const chart: echarts.EChartsType = createChart(id, option);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
      }); */
  });
</script>

<!--The div where the chart will be rendered. Must have width and height values for the chart to show.-->
<div {id} style="width: 100vh; height: 50vh;" />
