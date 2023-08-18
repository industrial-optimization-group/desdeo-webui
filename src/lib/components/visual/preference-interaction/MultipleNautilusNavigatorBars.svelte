<!--@component
    @description A component that displays a Nautilus navigation bar.
    TODO: documentation
    TODO: Make YAxis visible
    TODO: Add validation for input fields and lines
          - Aspiration value should be between upper and lower bounds
          - Aspiration line should not be draggable over the bound line
          - Bound value should be between ideal and nadir points
    TODO: Make min max values to be taken from value_ranges (if it is always correct)
    TODO: If chart is initialized from other than first iteration, the aspiration line is not drawn correctly.
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "$lib/components/visual/chartStore";
  // import { createChart } from "$lib/components/visual/stores";
  import type { SolutionData } from "$lib/components/visual/types";
  import { getChartModel } from "$lib/components/visual/helperFunctions";
  // import { element } from "svelte/internal";

  // The properties that can be passed to the component.
  export let id: string;
  export let data: SolutionData;
  let currentIterationIndex = 0;
  const names: string[] = data.names;
  // const values: number[][] = data.values;
  const firstIteration: number[] = data.values[0].slice();
  $: boundValues = Array(names.length);
  $: aspValues = Array(names.length).fill(0);
  $: navigationBars = [] as echarts.EChartsType[];
  // $: lastY = 0;
  // $: currentIterationIndex = 2;

  const aspirationLineStyle = {
    stroke: "blue",
    lineDash: [4],
    lineWidth: 3,
  };
  const boundLineStyle = {
    stroke: "red",
    // lineDash: [4],
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

  /** Updates the data that is used to draw the feasible region. */
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
    api: echarts.EChartOption.SeriesCustom.RenderItemApi,
    objectiveIndex: number
  ): echarts.EChartOption.SeriesCustom.RenderItemReturnPolygon {
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
      // transition doesnt work as expected, so it's better not to use it.
      // transition: ["shape"], // transition option not defined in RenderItemReturnPolygon, but is in the documentation:https://echarts.apache.org/en/option.html#series-custom.renderItem.return_polygon.transition
      // Should RenderItemReturnPolygon be extended to include the transition property?
      shape: {
        points: points,
        // smooth: 0.05,
      },
      style: {
        fill: color,
        stroke: echarts.color.lift(color, 0.1),
      },
    };
  }

  /**
   * Creates a new nautilus navigation bar.
   *
   * @param id The id of the div element where the chart will be drawn.
   * @param idx The index of the objective.
   */
  function addNautilusBar(id: string, idx: number) {
    const inputField = document.getElementsByName(
      names[idx]
    )[0] as HTMLInputElement;
    aspValues[idx] = firstIteration[idx];
    inputField.value = aspValues[idx];

    const chart = echarts.init(
      document.getElementById(id + idx) as HTMLDivElement,
      { renderer: "svg" }
    );

    // const upperBound = Math.max(
    //         ...bounds[idx].map((x) => {
    //           return x[1];
    //         })
    //       )

    // Default options for the chart.
    let newOption: echarts.EChartOption = {
      grid: {
        show: true,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      xAxis: {
        show: false,
        max: bounds[idx].length,
        axisPointer: {
          show: true,
          label: {
            formatter: function (params) {
              if (params.axisDimension === "x") {
                return (
                  Math.round((params.value / (maxIterations + 1)) * 100) + "%"
                );
              }
            },
          },
        },
      },
      // Get the max and min values from the current objective uncertainties and set them as the max and min values for the y-axis.
      yAxis: {
        // boundaryGap:["20%","20%"],
        max: "dataMax",
        min: "dataMin",
        // max: Math.ceil(upperBound) ,
        // min: Math.floor(
        //   Math.min(
        //     ...bounds[idx].map((x) => {
        //       return x[0];
        //     })
        //   )
        // ),
        position: "right",
        axisLine: {
          onZero: false,
        },
        // axisTick: {
        //   show: false,
        // },
        axisLabel: {
          // showMinLabel: false,
          // showMaxLabel: false,
          inside: true,
          formatter: function (value, index) {
            // console.log(chart.getOption().yAxis[0].splitNumber);
            // console.log(value, index);
            if (index === 0) {
              return "Worst = " + value.toFixed(2);
            } else if (index === 6) {
              return "Best =  " + value.toFixed(2);
            }
            return value.toFixed(2);
          },
        },
      },
      tooltip: {
        show: false,
        triggerOn: "mousemove",
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
    chart.setOption(newOption);

    const xAxisRect = getChartModel(chart)
      .getComponent("xAxis")
      .axis.grid.getRect();

    chart.setOption({
      // Add aspiration value line
      graphic: [
        {
          type: "group",
          id: "aspLine",
          children: [
            {
              id: "oldAspLine",
              // type: "line",
              type: "polyline",
              z: 3,
              // y: 0,
              shape: {
                points: [
                  [0, xAxisRect.height / 2],
                  [xAxisRect.width, xAxisRect.height / 2],
                ],
              },
              style: aspirationLineStyle,
              draggable: "vertical",
              // ondragstart: function (event){
              //   splitLine(chart, event.offsetX, event.offsetY);
              // },
              // onmousedown:function (event){

              //   // addNewLine(chart, event.offsetX, event.offsetY);
              // },
              ondrag: function (event: echarts.ElementEvent) {
                // Convert drag Y pixel value to Y real value and update the value to the aspValues (updates input field value also)
                aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
                  event.offsetX,
                  event.offsetY,
                ])[1];

                // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use

                // updateLine(chart, idx, event.offsetX, event.offsetY, false);
              },
              ondragend: function (event: echarts.ElementEvent) {
                // updateLineShape(chart, event.offsetX, event.offsetY);

                let lastY = event.offsetY;

                chart.setOption({
                  graphic: {
                    id: "oldAspLine",
                    lastY: lastY,
                    y: 0,
                    shape: {
                      points: [
                        [0, lastY],
                        [xAxisRect.width, lastY],
                      ],
                    },
                  },
                });
              },
            },
            {
              id: "verticalLine",
              type: "polyline",
              z: 4,
              x: chart.convertToPixel({ seriesIndex: 0 }, [
                currentIterationIndex,
                0,
              ])[0],
              shape: {
                points: [
                  [0, 0],
                  [0, xAxisRect.height],
                ],
              },
              style: {
                stroke: "black",
                lineWidth: 3,
              },
            },
            {
              id: "newAspLine",
              type: "polyline",
              lastY: -99,
              y: -99,
              z: 3,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: aspirationLineStyle,
              /* style: {
            stroke: "red",
            lineWidth: 6,
          }, */
              draggable: "vertical",
              ondrag: function (event: echarts.ElementEvent) {
                aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
                  event.offsetX,
                  event.offsetY,
                ])[1];
                chart.setOption({
                  graphic: {
                    id: "newAspLine",
                    lastY: event.offsetY,
                  },
                });
              },
            },
          ],
        },
        // Bound line options
        {
          type: "group",
          id: "boundLine",
          children: [
            {
              id: "oldBoundLine",
              // type: "line",
              type: "polyline",
              z: 3,
              // y: 0,
              shape: {
                points: [
                  [0, xAxisRect.height - 2],
                  [xAxisRect.width, xAxisRect.height - 2],
                ],
              },
              style: boundLineStyle,
              draggable: "vertical",
              // ondragstart: function (event){
              //   splitLine(chart, event.offsetX, event.offsetY);
              // },
              // onmousedown:function (event){

              //   // addNewLine(chart, event.offsetX, event.offsetY);
              // },
              ondrag: function (event: echarts.ElementEvent) {
                // Convert drag Y pixel value to Y real value and update the value to the aspValues (updates input field value also)
                boundValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
                  event.offsetX,
                  event.offsetY,
                ])[1];

                // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use

                // updateLine(chart, idx, event.offsetX, event.offsetY, false);
              },
              ondragend: function (event: echarts.ElementEvent) {
                // updateLineShape(chart, event.offsetX, event.offsetY);

                let lastY = event.offsetY;

                chart.setOption({
                  graphic: {
                    id: "oldBoundLine",
                    lastY: lastY,
                    y: 0,
                    shape: {
                      points: [
                        [0, lastY],
                        [xAxisRect.width, lastY],
                      ],
                    },
                  },
                });
              },
            },
            {
              id: "newBoundLine",
              type: "polyline",
              lastY: -99,
              y: -99,
              z: 2,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: boundLineStyle,
              /* style: {
            stroke: "red",
            lineWidth: 6,
          }, */
              draggable: "vertical",
              ondrag: function (event: echarts.ElementEvent) {
                boundValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
                  event.offsetX,
                  event.offsetY,
                ])[1];
                chart.setOption({
                  graphic: {
                    id: "newBoundLine",
                    lastY: event.offsetY,
                  },
                });
              },
            },
          ],
        },
      ],
    });

    /* chart.getZr().on("click", (param) => {
      // console.log(chart.convertFromPixel({seriesIndex: 0}, [param.offsetX, param.offsetY]));
      // const xClick = param.offsetX;
      // const yClick = param.offsetY;
      // updateLine(chart, idx, xClick, yClick, true);
    }); */

    navigationBars.push(chart);
  }

  onMount(() => {
    for (let i = 0; i < names.length; i++) {
      addNautilusBar(id, i);
    }
  });

  //TODO: step line dragging
  function updateStepLine(chart: echarts.EChartsType) {
    let xForVerticalLine = chart.convertToPixel({ seriesIndex: 0 }, [
      currentIterationIndex,
      0,
    ])[0];

    chart.setOption({
      graphic: [
        {
          id: "verticalLine",
          type: "polyline",

          x: xForVerticalLine,
        },
      ],
    });
  }

  /**
   * Updates the y-position of the aspiration line according to the new y-value.
   *
   * @param chart The chart where the aspiration line is.
   * @param newY The new y-value.
   */
  function updateLine(
    chart: echarts.EChartsType,
    newY: number,
    lineName?: string
  ) {
    applyForMultipleLines((oldName, newName) => {
      let oldLineComponentPoints = getLineComponent(chart, "oldAspLine").shape
        .points;
      // let teset = getLineComponent(chart, "aspLine");
      oldLineComponentPoints[0][1] = newY;
      oldLineComponentPoints[1][1] = newY;
      if (currentIterationIndex == 0) {
        chart.setOption({
          graphic: [
            {
              id: oldName,
              shape: {
                points: oldLineComponentPoints,
              },
            },
          ],
        });
      } else {
        chart.setOption({
          graphic: [
            {
              id: newName,
              lastY: newY,
              y: newY,
              transition: "y",
            },
          ],
        });
      }
    }, lineName);
  }

  /**
   * Updates the shape of the aspiration line so that the line before current
   * iteration shows the history of the aspiration line.
   *
   * @param chart The chart where the aspiration line is.
   */
  function splitLine(chart: echarts.EChartsType) {
    let oldLineComponent;
    let oldLinePoints;
    // let verticalLineComponent;
    // Dont resize on the first iteration
    if (currentIterationIndex == 0) {
      return;
    }

    applyForMultipleLines((wholeNameOld, wholeNameNew) => {
      let verticalLineComponent = getLineComponent(chart, "verticalLine");
      // Get the components of the aspiration line and the vertical line
      oldLineComponent = getLineComponent(chart, wholeNameOld);
      oldLinePoints = oldLineComponent.shape.points;

      //get the newLine
      let newAspLineComponent = getLineComponent(chart, wholeNameNew);
      let newAspLinePoints = newAspLineComponent.shape.points;
      let lastY =
        newAspLineComponent.lastY < 0
          ? oldLineComponent.lastY
          : newAspLineComponent.lastY;
      if (currentIterationIndex == 1) {
        oldLinePoints[1][0] = verticalLineComponent.x;
      }
      // The line between the old aspiration values line and the current iteration vertical line
      let betweenLine = [
        [0, 0],
        [0, 0],
      ];
      let newPoints = oldLinePoints;
      if (newAspLinePoints[0][0] > 0) {
        newAspLinePoints[1][0] = verticalLineComponent.x;
        betweenLine = [
          [newAspLinePoints[0][0], lastY],
          [verticalLineComponent.x, lastY],
        ];
        newPoints = oldLinePoints.concat(betweenLine);
      }

      // Update the position of the aspiration line and make it visible
      chart.setOption({
        graphic: [
          {
            id: wholeNameOld,
            lastY: lastY,
            shape: {
              points: newPoints,
            },
          },
        ],
      });
    });
  }

  /**
   * Adds the draggable part of the aspiration line.
   *
   * @param chart The chart where the aspiration line is.
   */
  function addNewLine(chart: echarts.EChartsType) {
    // Get the components of the aspiration line and the vertical line
    applyForMultipleLines((wholeNameOld, wholeNameNew) => {
      let verticalLineComponent = getLineComponent(chart, "verticalLine");
      let oldLineComponent = getLineComponent(chart, wholeNameOld);
      const lastIndex = oldLineComponent.shape.points.length - 1;
      // const oldLineLastX = oldLineComponent.shape.points[lastIndex][0];
      const oldLineLastY = oldLineComponent.shape.points[lastIndex][1];
      const newY = oldLineComponent.lastY
        ? oldLineComponent.lastY
        : oldLineLastY;

      let newAspLinePoints = [
        [verticalLineComponent.x, 0],
        [
          getChartModel(chart).getComponent("xAxis").axis.grid.getRect().width,
          0,
        ],
      ];

      // Update the position of the aspiration line so that it is visible (and draggable) again.
      chart.setOption({
        graphic: {
          id: wholeNameNew,
          lastY: newY,
          y: newY,
          shape: {
            points: newAspLinePoints,
          },
        },
      });
    });
  }

  /**
   * Gets the component of the wanted part of the aspiration line.
   *
   * @param chart The chart where the aspiration line is.
   * @param lineId The id of the wanted part of the aspiration line.
   */
  function getLineComponent(chart: echarts.EChartsType, lineId: string) {
    let graphicComponent = chart.getOption()
      .graphic as echarts.GraphicComponentOption;

    // Get the component
    // Type check
    if (graphicComponent instanceof Array && graphicComponent.length > 0) {
      return graphicComponent[0].elements.find(
        (property: echarts.GraphicComponentOption) => property.id === lineId
      );
    }
  }

  function applyForMultipleLines(
    funToApply: (nameOld: string, nameNew: string) => void,
    onlyLinename?: string
  ) {
    if (onlyLinename) {
      funToApply("old" + onlyLinename, "new" + onlyLinename);
    } else {
      ["AspLine", "BoundLine"].forEach((lineTypeName) => {
        let wholeNameOld = "old" + lineTypeName;
        let wholeNameNew = "new" + lineTypeName;
        funToApply(wholeNameOld, wholeNameNew);
      });
    }
  }

  function handleChange(
    par: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
    i: number
  ) {
    const target = par.target as HTMLElement;
    const nextSibling = target.parentElement?.nextElementSibling;
    if (!nextSibling) {
      return;
    }
    const chart = echarts.getInstanceByDom(nextSibling as HTMLDivElement);
    let newY = chart.convertToPixel({ seriesIndex: 0 }, [0, boundValues[i]])[1];
    updateLine(chart, newY, "BoundLine");
  }
</script>

<!-- Button for simulating iterating -->
<button
  on:click={function () {
    if (currentIterationIndex < maxIterations) {
      currentIterationIndex = currentIterationIndex + 1;
      navigationBars.map((chart) => {
        // chart.resize({width: "200", height: "200"});
        updateData();
        updateStepLine(chart);
        if (currentIterationIndex > 0) {
          splitLine(chart);
          addNewLine(chart);
        }
        chart.setOption({});
      });
    }

    // console.log(currentIterationIndex);
  }}>Next Iteration</button
>
<p>{currentIterationIndex}</p>
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
          on:change={(par) => handleChange(par, i)}
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
          on:change={(par) => handleChange(par, i)}
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
