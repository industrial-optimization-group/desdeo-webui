<!--@component
    @description A component that displays a Nautilus navigation bar.
    TODO: documentation
    TODO: Make YAxis visible
    TODO: Add validation for input fields and lines
          - Aspiration value should be between upper and lower bounds
          - Aspiration line should not be draggable over the bound line
          - Bound value should be between ideal and nadir points
    TODO: Make min max values to be taken from value_ranges (if it is always correct)
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
  let currentIterationIndex = 2;
  const names: string[] = data.names;
  // const values: number[][] = data.values;
  const firstIteration: number[] = data.values[0].slice();
  $: boundValues = Array(names.length);
  $: aspValues = Array(names.length).fill(0);
  $: navigationBars = [];
  // $: currentIterationIndex = 2;

  const aspirationLineStyle = {
    stroke: "blue",
    lineDash: [4],
    lineWidth: 3,
  };
  /*   const upperBounds = [
    [10, 9, 7, 5, 5, 5], // objective 1
    [2.0, 1.9, 1.5, 0.8, 0.6, 0.6], // objective 2
    [5, 4.5, 4, 3, 2.8, 2.8], // objective 3
  ];
  const lowerBounds = [
    [0, 0.2, 0.3, 0.5, 1.5, 1.5], // objective 1
    [0.0, 0.05, 0.1, 0.15, 0.2, 0.2], // objective 2
    [-5, -4, -3, 0.2, 0.5, 0.5], // objective 3
  ];
  let firstPart = upperBounds[0]; */

  const bounds: number[][][] = data.uncertainty;
  let maxIterations = bounds[0].length - 1;

  // let secondPart: Array<number> = lowerBounds[0];
  //reverse secondPart

  // let shapeData = [];
  // for (let i = 0; i < upperBounds.length; i++) {
  //   shapeData.push([i,upperBounds]);
  // }

  /* uncertainty: [
      //Objective1:
      [
        [0.9, 1.1], // [lower, upper] of the first iteration
        [1.9, 2.1], // [lower, upper] of the second iteration
        [2.9, 3.1], // [lower, upper] of the third iteration
      ],
      //Objective2:
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
    ], */

  let objectiveShapes: number[][][] = [];
  updateData();

  function updateData() {
    objectiveShapes = [];
    names.forEach((_, objectiveIndex) => {
      let objShape: number[][] = [];

      for (let index = 0; index <= currentIterationIndex; index++) {
        let iterationBounds = bounds[objectiveIndex][index];
        const lowerBound = iterationBounds[0];
        objShape.push([index, lowerBound]);
      }
      for (let index = currentIterationIndex; index >= 0; index--) {
        let iterationBounds = bounds[objectiveIndex][index];
        const upperBound = iterationBounds[1];
        objShape.push([index, upperBound]);
      }
      objectiveShapes.push(objShape);
    });
  }

  /*   // This works only for original bounds, the data is copied from desdeo components. 
  names.forEach((_, row) => {
    let objShape: number[][] = [];
    firstPart = upperBounds[row];
    let secondPart = lowerBounds[row];

   for (let index = 0; index < currentItaration; index++) {
    const value = firstPart[index];
    objShape.push([index, value]);
   }
    for (let index = currentItaration - 1; index >= 0; index--) {
      const value = secondPart[index];
      objShape.push([index, value]);
    }
    objectiveShapes.push(objShape);
  }); */

  // The chart will be created when the component is mounted. This is done to ensure that the div element exists.

  function draw(
    // params,
    api: echarts.EChartOption.SeriesCustom.RenderItemApi,
    objectiveIndex: number
  ): echarts.EChartOption.SeriesCustom.RenderItemReturnPolygon {
    // if (params.context.rendered) {
    //   return {};
    // }
    // params.context.rendered = true;

    let points = [];
    if (!api.coord || !api.visual) {
      return {};
    }
    for (let i = 0; i < objectiveShapes[objectiveIndex].length; i++) {
      points.push(api.coord(objectiveShapes[objectiveIndex][i]));
    }
    let color = api.visual("color");
    return {
      type: "polygon",
      // transition: ["shape"], // transition option not defined in RenderItemReturnPolygon, but is in the documentation:https://echarts.apache.org/en/option.html#series-custom.renderItem.return_polygon.transition
      // Should RenderItemReturnPolygon be extended to include the transition property?
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
    const inputField = document.getElementsByName(
      names[idx]
    )[0] as HTMLInputElement;
    aspValues[idx] = firstIteration[idx];
    inputField.value = aspValues[idx];

    const chart = echarts.init(
      document.getElementById(id + idx) as HTMLDivElement,
      {
        grid: {
          show: true,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
      { renderer: "svg" }
    );

    let newOption: echarts.EChartOption = {
      xAxis: {
        show: false,
        max: bounds[idx].length,
      },
      // Get the max and min values from the current objective uncertainties and set them as the max and min values for the y-axis.
      yAxis: {
        max: Math.ceil(
          Math.max(
            ...bounds[idx].map((x) => {
              return x[1];
            })
          )
        ),
        min: Math.floor(
          Math.min(
            ...bounds[idx].map((x) => {
              return x[0];
            })
          )
        ),
      },
      axisPointer: {
        show: true,
      },
      series: [
        {
          type: "custom",

          renderItem: (_, api) => {
            return draw(api, idx);
          },
          data: objectiveShapes[idx],
        },
      ],
    };
    // chart.on("finished", function () {
    //   console.log("tes");
    //   this.getVisual("series", "color");
    // });
    chart.setOption(newOption);
    // const xAxisModel = chart.getModel().getComponent("xAxis");
    // console.log(xAxisModel);
    const xAxisRect = chart
      .getModel() // TODO: How to get info needed without getModel. This is a private method and it can break in the future!!https://github.com/apache/echarts/issues/16479
      .getComponent("xAxis")
      .axis.grid.getRect();
    // console.log(xAxisRect);
    // console.log(chart.convertToPixel({ seriesIndex: 0 }, [0, -50]));
    // console.log(xAxisRect.width);
    // console.log(xAxisRect.height);
    // console.log(chart.getWidth());
    // console.log(chart.getHeight());
    console.log(currentIterationIndex);
    chart.setOption({
      // Add aspiration value line
      graphic: [
        {
          id: "OldAspLine",
          // type: "line",
          type: "polyline",
          z: 100,
          shape: {
            points: [
              [0, xAxisRect.height / 2],
              [xAxisRect.width, xAxisRect.height / 2],
            ],
          },
          style: aspirationLineStyle,
        },
        {
          id: "BetweenLine",
          type: "polyline",
          z: 100,
          transition: "shape",

          x: chart.convertToPixel({ seriesIndex: 0 }, [
            currentIterationIndex,
            0,
          ])[0],
          shape: {
            points: [
              [0, xAxisRect.height / 2],
              [0, xAxisRect.height / 2],
            ],
          },
        },
        {
          id: "NewAspLine",
          // type: "line",
          type: "polyline",
          y: xAxisRect.height / 2,
          z: 100,
          shape: {
            points: [
              [0, 0],
              [xAxisRect.width, 0],
            ],
          },
          transition: "y",
          style: aspirationLineStyle,
          draggable: "vertical",
          ondrag: function () {
            // console.log("shape:");
            // console.log(this.shape.points[0][0]);
            // console.log(this.shape.points[0][1]);
            // console.log("this:");
            // console.log(this.coordSys);

            // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use
            // console.log(this.x);
            // console.log(this.y);
            updateLine(chart, idx, this.x, this.y, false);
          },
        },
      ],
    });

    chart.getZr().on("click", (param) => {
      // console.log(chart.convertFromPixel({seriesIndex: 0}, [param.offsetX, param.offsetY]));

      console.log(param.offsetX, param.offsetY);
      console.log(param);
      console.log(chart.getOption());
      const xClick = param.offsetX;
      const yClick = param.offsetY;

      updateLine(chart, idx, xClick, yClick, true);

      console.log(chart.getOption());
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

    navigationBars.push(chart);
  }

  function updateLine(
    chart: echarts.EChartsType,
    idx: number,
    xNew: number | undefined,
    yNew: number,
    transition: boolean
  ) {
    let oldPoints = chart.getOption().graphic[0].elements[0].shape.points;
    xNew = chart.convertToPixel({ seriesIndex: 0 }, [
      currentIterationIndex,
      0,
    ])[0];
    const xOld = oldPoints[0][0];
    const yOld = oldPoints[0][1];
    console.log(xOld);
    console.log(yOld);
    const xAxisRect = chart
      .getModel()
      .getComponent("xAxis")
      .axis.grid.getRect();
    let betweenLineTransition = "";

    // const xNew = param.offsetX;
    // const yNew = param.offsetY;

    // Set transition effect when the line is dragged
    if (transition) {
      betweenLineTransition = "shape";
    }
    aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
      xNew,
      yNew,
    ])[1];

    // let newPoints = [
    //   [xOld, yOld],
    //   [xClick, yOld],
    //   [xClick, yClick],
    //   [xAxisRect.width, yClick],
    // ];
    const oldAspLinePoints = [
      [xOld, yOld],
      [xNew, yOld],
    ];
    const betweenLinePoints = [
      [0, yOld],
      [0, yNew],
    ];
    const newAspLinePoints = [
      [xNew, 0],
      [xAxisRect.width, 0],
    ];

    chart.setOption({
      graphic: [
        // {
        //   id: "AspLine",
        //   invisible: originalInvisible,
        //   shape: {
        //     points: [[0, yNew], [xAxisRect.width, yNew]],
        //   },
        // },
        {
          id: "OldAspLine",
          type: "polyline",
          z: 200,
          shape: {
            points: oldAspLinePoints,
          },
          style: aspirationLineStyle,
          // transition: "y",
        },
        {
          id: "BetweenLine",
          type: "polyline",

          z: 200,
          x: xNew,
          // y: yNew,
          shape: {
            points: betweenLinePoints,
          },
          style: aspirationLineStyle,
          transition: betweenLineTransition,
        },
        {
          id: "NewAspLine",
          type: "polyline",
          z: 200,
          y: yNew,
          shape: {
            points: newAspLinePoints,
          },
          style: aspirationLineStyle,
        },
      ],
    });
    console.log(chart.getOption());
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
<button
  on:click={function () {
    // console.log(params);
    // console.log(currentIterationIndex);
    if (currentIterationIndex < maxIterations) {
      currentIterationIndex = currentIterationIndex + 1;
      navigationBars.map((chart) => {
        console.log(chart.getOption());
        updateData();
        chart.setOption({});
      });
    } else {
      console.log("Max iterations reached");
    }

    // console.log(currentIterationIndex);
  }}>Next Iteration</button
>
<p>{currentIterationIndex}</p>
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
            console.log("Chanfge event");
            console.log(par);
            const chart = echarts.getInstanceByDom(
              par.target.parentElement.nextElementSibling
            );
            console.log("chart pos");
            console.log(aspValues[i]);
            console.log(
              chart.convertToPixel({ seriesIndex: 0 }, [0, aspValues[i]])[1]
            );
            let newY = chart.convertToPixel({ seriesIndex: 0 }, [
              0,
              aspValues[i],
            ])[1];
            updateLine(chart, i, undefined, newY, true);
          }}
        />
        <!-- on:change={(par) => handleOnchange(par, i)} -->
        <label for="bounds">Bounds </label>
        <input
          type="number"
          name="bounds"
          min="0"
          step="any"
          bind:value={boundValues[i]}
          placeholder="Set upper/lower bound here"
          on:change={(par) => {
            const chart = echarts.getInstanceByDom(
              par.target.parentElement.nextElementSibling
            );
            const xAxisRect = chart
              .getModel()
              .getComponent("xAxis")
              .axis.grid.getRect();
            let newY = chart.convertToPixel({ seriesIndex: 0 }, [
              0,
              boundValues[i],
            ])[1];

            chart.setOption({
              graphic: [
                {
                  id: "BoundLine",
                  type: "polyline",
                  z: 250,
                  y: newY,
                  transition: "y",
                  shape: {
                    points: [
                      [0, 0],
                      [xAxisRect.width, 0],
                    ],
                  },
                  style: {
                    stroke: "red",
                    lineWidth: 2,
                    opacity: 0.5,
                  },
                },
              ],
            });
          }}
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
