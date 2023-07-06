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
      },
      style: api.style({
        fill: color,
        stroke: echarts.color.lift(color, 0.1),
      }),
    };
  }

  function addNautilusBar(id: string, idx: number) {
    const chart = echarts.init(
      document.getElementById(id + idx) as HTMLDivElement
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
    // chart.setOption({
    //   inputIndex: idx,
    //   // Set the min max values for the bar
    //   xAxis: {
    //     min: data.value_ranges[idx][0],
    //     max: data.value_ranges[idx][1],
    //   },
    //   // Set the color of the bar
    //   series: {
    //     color: colorPalette[idx],
    //     showBackground: true,
    //     backgroundStyle: {
    //       color: colorPalette[idx],
    //       opacity: 0.2,
    //     },
    //     type: "bar",
    //     data: [firstIteration[idx]],
    //     barWidth: "100%",
    //   },
    // });

    // const gridModel = chart.getModel().getComponent("grid");
    // const gridView = chart.getViewOfComponentModel(gridModel);
    // const gridRect = gridView.group.getBoundingRect();

    // // This option adds the interactive custom graphic elements to the chart
    // const graphicOptions = {
    //   graphic: [
    //     // Add a button (arrow) to reset the aspiration value to the solution value.
    //     {
    //       id: "arrow",
    //       type: "polygon",
    //       x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
    //       shape: {
    //         points: [
    //           [-arrowSize, 0],
    //           [arrowSize, 0],
    //           [0, arrowSize],
    //         ],
    //       },
    //       style: {
    //         fill: arrowColor,
    //       },
    //       onclick: () => {
    //         const inputField = document.getElementsByName(names[idx])[0];
    //         aspValues[idx] = firstIteration[idx];
    //         inputField.value = aspValues[idx];
    //         inputField.dispatchEvent(new Event("change"));
    //       },
    //     },

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

    //     // Add a line for previous preference
    //     {
    //       id: "prev_line",
    //       type: "rect",
    //       x: chart.convertToPixel({ seriesIndex: 0 }, [
    //         fakePreviousIteration[idx],
    //         0,
    //       ])[0],
    //       y: gridRect.y,
    //       z: 5,
    //       transition: "all",
    //       shape: {
    //         height: gridRect.height,
    //       },
    //       style: {
    //         stroke: "blue",
    //         lineDash: [4],
    //         lineWidth: 3,
    //       },
    //     },

    //     // Add arrows
    //     {
    //       type: "group",
    //       top: "center",
    //       children: [
    //         //Left Arrow
    //         {
    //           type: "polygon",
    //           id: "left",
    //           shape: {
    //             points: [
    //               [-1, arrowSize],
    //               [-1, -arrowSize],
    //               [-arrowSize, 0],
    //             ],
    //           },
    //           style: {
    //             fill: arrowColor,
    //           },
    //           left: 0,
    //         },
    //         // Right Arrow
    //         {
    //           type: "polygon",
    //           id: "right",
    //           shape: {
    //             points: [
    //               [1, arrowSize],
    //               [1, -arrowSize],
    //               [arrowSize, 0],
    //             ],
    //           },
    //           style: {
    //             fill: arrowColor,
    //           },
    //           left: chart.getWidth() - arrowSize,
    //         },
    //       ],
    //       // onclick event for the arrows
    //       onclick: (params) => {
    //         const targetId = params.target.id;
    //         if (targetId === "left") {
    //           aspValues[idx] = data.value_ranges[idx][0];
    //         } else if (targetId === "right") {
    //           aspValues[idx] = data.value_ranges[idx][1];
    //         }
    //         const inputField = document.getElementsByName(names[idx])[0];
    //         inputField.value = aspValues[idx];
    //         inputField.dispatchEvent(new Event("change"));
    //       },
    //     },
    //     // Invisible rectangle for the whole grid area, so that clicking on the grid area works correctly
    //     {
    //       type: "rect",
    //       shape: {
    //         x: gridRect.x,
    //         y: gridRect.y,
    //         width: gridRect.width,
    //         height: gridRect.height,
    //       },
    //       style: {
    //         fill: "transparent",
    //         stroke: "transparent",
    //         lineWidth: 0,
    //       },
    //     },
    //   ],
    // };
    // chart.setOption(graphicOptions);
    // Add event listener which adds and updates the aspiration line on the graph.
    // chart.getZr().on("click", function (params) {
    //   if (params.target == null) {
    //     return;
    //   }
    //   const targetId: number | string = params.target.id;
    //   // TODO: Make this more cleaner
    //   // Only update the line if the click is on the grid area
    //   if (
    //     !(
    //       targetId === "left" ||
    //       targetId === "right" ||
    //       targetId === "rec" ||
    //       targetId === "arrow"
    //     )
    //   ) {
    //     updateLine(params, chart, idx);
    //     return;
    //   }
    // });
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
