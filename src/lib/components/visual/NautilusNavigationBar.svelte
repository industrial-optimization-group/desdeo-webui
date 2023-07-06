<!--@component
    @description This is a template for a component that uses ECharts. It is not meant to be used directly.
-->

<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  // import { createChart } from "./stores";
  import type { SolutionData } from "./types";
  // import { element } from "svelte/internal";

  // The properties that can be passed to the component.
  export let id: string;
  export let data: SolutionData;
  const names: string[] = data.names;
  $: aspValues = [0, 0, 0];

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
  // let secondPart: Array<number> = lowerBounds[0];
  //reverse secondPart

  // let shapeData = [];
  // for (let i = 0; i < upperBounds.length; i++) {
  //   shapeData.push([i,upperBounds]);
  // }

  let objectiveShapes = [];

  names.forEach((_, row) => {
    let objShape = [];
    firstPart = upperBounds[row];
    let secondPart = lowerBounds[row];

    objShape.push(...firstPart.map((value, index) => [index, value]));
    objShape.push(
      ...secondPart
        .slice()
        .reverse()
        .map((value, index) => [secondPart.length - index - 1, value])
    );
    objectiveShapes.push(objShape);
  });

  // The chart will be created when the component is mounted. This is done to ensure that the div element exists.

  function draw(
    // params,
    api,
    objectiveIndex: number
  ): echarts.EChartOption.SeriesCustom.RenderItemReturnPolygon {
    // if (params.context.rendered) {
    //   return {};
    // }
    // params.context.rendered = true;
    let points = [];
    for (let i = 0; i < objectiveShapes[objectiveIndex].length; i++) {
      points.push(api.coord(objectiveShapes[objectiveIndex][i]));
    }
    let color = api.visual("color");
    return {
      type: "polygon",
      transition: ["shape"],
      shape: {
        points: points,
        smooth: 0.05,
      },
      style: {
        fill: color,
        stroke: echarts.color.lift(color, 0.1),
      },
    };
  }

  function addNautilusBar(id: string, idx: number) {
    const chart = echarts.init(
      document.getElementById(id + idx) as HTMLDivElement,
      null,
      { renderer: "svg" }
    );
    // Create the option object for the whole chart. This example creates a basic bar chart.
    let newOption: echarts.EChartOption = {
      xAxis: { show: false },
      yAxis: {},
      axisPointer: {
        show: true,
      },
      series: [
        {
          type: "custom",
          renderItem: (_, api) => {
            return draw(api, idx);
          },
          clip: true,
          data: objectiveShapes[idx],
        },
      ],
    };
    chart.setOption(newOption);

    const gridModel = chart.getModel().getComponent("xAxis");
    console.log(gridModel);
    // const gridView = chart.getGridModel();
    // console.log(gridView);
    const gridRect = chart.getModel().getComponent("xAxis").axis.grid.getRect();
    console.log(gridRect);
    console.log(chart.convertToPixel({ seriesIndex: 0 }, [0, -50]));

    chart.setOption({
      // Add aspiration value line
      graphic: {
        // id: "line",
        // type: "line",
        type: "rect",
        x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
        y: 100,
        z: 100,
        transition: "all",
        // shape: {
        //   x1: 0,
        //   y1: 0,
        //   x2: gridRect.width,
        //   y2: 0,
        // },
        shape: {
          width: gridRect.width,
        },
        style: {
          stroke: "blue",
          lineDash: [4],
          lineWidth: 3,
        },
        draggable: "vertical",
        ondrag: function () {
          console.log(this);
          console.log(this.x);
          console.log(this.y);
        },
      },
    });

    // chart.setOption({
    //   graphic: echarts.util.map(
    //     objectiveShapes[idx],
    //     function (item, dataIndex) {
    //       return {
    //         type: "circle",
    //         position: chart.convertToPixel("grid", item),
    //         // z: 100,
    //         shape: { r: 15 },
    //         invisible: false,
    //         draggable: true,
    //         ondrag: echarts.util.curry((dataIndex, dx, dy) => {
    //           // Here the `data` is declared in the code block in the beginning
    //           // of this article. The `this` refers to the dragged circle.
    //           // `this.position` is the current position of the circle.
    //           objectiveShapes[idx][dataIndex] = chart.convertFromPixel("grid", [
    //             dx,
    //             dy,
    //           ]);
    //           // Re-render the chart based on the updated `data`.
    //           chart.setOption({
    //             series: [
    //               {
    //                 id: "a",
    //                 data: objectiveShapes[idx],
    //               },
    //             ],
    //           });
    //         }, dataIndex),
    //         z: 100,
    //       };
    //     }
    //   ),
    // });

    chart.setOption({
      graphic: [],
    });
    // const gridModel = chart.getModel().getComponent("grid");
    // const gridView = chart.getViewOfComponentModel(gridModel);
    // const gridRect = gridView.group.getBoundingRect();

    // // This option adds the interactive custom graphic elements to the chart
    // const graphicOptions = {

    //     // Add aspiration value line
    //     {
    //       id: "rec",
    //       type: "rect",
    //       x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
    //       y: gridRect.y,
    //       z: 100,
    //       transition: "all",
    //       shape: {
    //         height: gridRect.height,
    //       },
    //       style: {
    //         stroke: "red",
    //         lineWidth: 3,
    //       },
    //     },
  }

  onMount(() => {
    // createChart(id, option);
    for (let i = 0; i < names.length; i++) {
      addNautilusBar(id, i);
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
<div>
  {#each names as name, i}
    {#if data.minimize[i]}
      <p><strong>{name} (minimize)</strong></p>
    {:else}
      <p><strong>{name} (maximize)</strong></p>
    {/if}
    <div class="bar_container" style="display: flex; margin-top:0.75em">
      <div>
        <label for={name}>Reference point</label>
        <input
          class="asp_input"
          {name}
          type="number"
          min={data.value_ranges[i][0]}
          max={data.value_ranges[i][1]}
          step="any"
          bind:value={aspValues[i]}
          on:change={(par) => {
            console.log(par);
          }}
        />
        <!-- on:change={(par) => handleOnchange(par, i)} -->
        <label for="prev">Previous preference </label>
        <input
          type="number"
          name="prev"
          placeholder="2.543"
          style="border: 0; box-shadow: none;background-color: rgba(232 234 241);"
        />
      </div>
      <div
        id={id + i}
        class="chart_div"
        style="width: 70vh; height: 2vh; min-height: 300px; margin-left:2em"
      />
    </div>
  {/each}
</div>
