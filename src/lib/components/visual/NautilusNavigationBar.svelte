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
  let currentIterationIndex = 0;
  const names: string[] = data.names;
  // const values: number[][] = data.values;
  const firstIteration: number[] = data.values[0].slice();
  $: boundValues = Array(names.length);
  $: aspValues = Array(names.length).fill(0);
  $: navigationBars = [];
  // $: lastY = 0;
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
        // smooth: 0.05,
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
      { renderer: "svg" }
    );

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
          id: "oldAspLine",
          // type: "line",
          type: "polyline",
          z: 199,
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
          ondrag: function (event) {
            // Convert drag Y pixel value to Y real value and update the value to the aspValues (updates input field value also)
            aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
              event.offsetX,
              event.offsetY,
            ])[1];
            console.log("this:");
            console.log(this.target);
            console.log(this);
            console.log(event);
            // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use
            console.log(event.offsetX);
            console.log(event.offsetY);
            // updateLine(chart, idx, event.offsetX, event.offsetY, false);
          },
          ondragend: function (event) {
            // updateLineShape(chart, event.offsetX, event.offsetY);
            console.log(this);
            console.log(event);
            let lastY = event.offsetY;
            console.log(lastY);
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
            console.log(chart.getOption().graphic[0].elements);
          },
          /* ondragend: function () {
            if (currentIterationIndex > 0) {
              console.log("get rid of drag");
              chart.setOption({
                graphic: {
                  id: "OldAspLine",
                  draggable: false,
                },
              });
            }
          }, */
        },
        {
          id: "verticalLine",
          type: "polyline",
          z: 100,
          // transition: "shape",

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
          // y: xAxisRect.height / 2,
          z: 200,
          // transition: "y",
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
          // silent: true,
          // invisible: true,
          draggable: "vertical",
          ondrag: function (event) {
            aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
              event.offsetX,
              event.offsetY,
            ])[1];
            console.log("shape:");
            chart.setOption({
              graphic: {
                id: "newAspLine",
                lastY: event.offsetY,
              },
            });
            // console.log(this.shape.points[0][0]);
            // console.log(this.shape.points[0][1]);
            // console.log("this:");
            // console.log(this);

            // // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use
            // console.log(this.x);
            // console.log(this.y);
            // updateLine(chart, idx, this.x, this.y, false);
          },
        },
      ],
    });

    chart.getZr().on("click", (param) => {
      // console.log(chart.convertFromPixel({seriesIndex: 0}, [param.offsetX, param.offsetY]));

      console.log(param.offsetX, param.offsetY);
      console.log(param);
      console.log(chart.getOption());
      // const xClick = param.offsetX;
      // const yClick = param.offsetY;

      // updateLine(chart, idx, xClick, yClick, true);

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

  /* function updateLine(
    chart: echarts.EChartsType,
    idx: number,
    xNew = null,
    yNew = null,
    transition = false
  ) {
    let oldLineComponent;
    let oldLinePoints;
    let previousNewLineProperty;
    let graphicComponent = chart.getOption()
      .graphic as echarts.GraphicComponentOption;

    // Type check
    if (graphicComponent instanceof Array && graphicComponent.length > 0) {
      oldLineComponent = graphicComponent[0].elements.find(
        (property: echarts.GraphicComponentOption) =>
          property.id === "OldAspLine"
      );
      oldLinePoints = oldLineComponent.shape.points;

      previousNewLineProperty = graphicComponent[0].elements.find(
        (property: echarts.GraphicComponentOption) =>
          property.id === "NewAspLine"
      );
    }

    // xNew = chart.convertToPixel({ seriesIndex: 0 }, [
    //   currentIterationIndex,
    //   0,
    // ])[0];
    const x1Old = oldLinePoints[0][0];
    const x2Old = oldLinePoints[1][0];
    const yOld = oldLineComponent.y;

    let x1newAspLine;
    const xAxisRect = chart
      .getModel()
      .getComponent("xAxis")
      .axis.grid.getRect();
    let x2newAspLine = xAxisRect.width;

    console.log(x1Old);
    console.log(yOld);

    // if xNew or yNew is undefined, use the value of the previous user defined aspiration line
    // if (xNew == null) {
    //   xNew = previousNewLineProperty.shape.points[0][0];
    // } else if (yNew == null) {
    //   yNew = previousNewLineProperty.y;
    // } else{
    //   xNew = chart.convertToPixel({ seriesIndex: 0 }, [
    //     currentIterationIndex,
    //     0,
    //   ])[0];
    // }

    let x2OldLine;
    let yOldLine;

    // if (xNew == 0){
    //   xNew = xForVerticalLine
    // }

    let invisible;
    //
    if (currentIterationIndex == 0 || oldLineComponent.draggable) {
      chart.setOption({
        graphic: {
          id: "OldAspLine",
          draggable: "vertical",
        },
      });
      invisible = true;
      x2newAspLine = 0;
    } else {
      chart.setOption({
        graphic: {
          id: "OldAspLine",
          z: 199,
          draggable: false,
        },
      });
      invisible = false;
    }
    let test;
    if (xNew == null && yNew == null) {
      // xNew = xForVerticalLine;
      yNew = previousNewLineProperty.y;
      if (previousNewLineProperty.shape) {
        x1newAspLine = previousNewLineProperty.shape.points[0][0];
      } else {
        // Use the original line
        console.log("test");
      }

      x2OldLine = x2Old;
      yOldLine = yOld;
      test = [
        [x2Old, yNew],
        [xForVerticalLine, yNew],
      ];
      test = oldLinePoints.concat(test);
    } else {
      // xNew = previousNewLineProperty.shape.points[0][0];
      // x2OldLine = yOld
      xNew = xForVerticalLine;
      x1newAspLine = xNew;

      x2OldLine = x2Old;

      // yOldLine = yNew
      // If the x2 of old line is not on the vertical line then
      if (
        xForVerticalLine != oldLinePoints[1][0] &&
        currentIterationIndex != 0
      ) {
        x2OldLine = previousNewLineProperty.shape.points[0][0]; // x1 of the previous aspiration line
        yOldLine = yNew;
      }
    }

    if (!x2OldLine || invisible) {
      x2OldLine = oldLinePoints[1][0];
    }

    let verticalLineTransition = "";

    //CONCAT TEST AND OLDASPPOINTS AND SEE WHAT HAPPENS

    // const xNew = param.offsetX;
    // const yNew = param.offsetY;

    // Set transition effect when the line is dragged
    if (transition) {
      verticalLineTransition = "shape";
    }

    // let newPoints = [
    //   [xOld, yOld],
    //   [xClick, yOld],
    //   [xClick, yClick],
    //   [xAxisRect.width, yClick],
    // ];
    let oldAspLinePoints;
    if (test) {
      oldAspLinePoints = test;
    } else {
      oldAspLinePoints = [
        [0, yNew],
        [x2OldLine, yNew],
      ];
    }
    // Use the upper if first iteration

    const newAspLinePoints = [
      [x1newAspLine, 0],
      [x2newAspLine, 0],
    ];

    chart.setOption({
      graphic: [
        {
          id: "OldAspLine",
          type: "polyline",
          // y: 50,
          shape: {
            points: oldAspLinePoints,
          },
          style: aspirationLineStyle,
          // transition: "y",
        },

        {
          id: "NewAspLine",
          type: "polyline",
          invisible: invisible,
          y: yNew,
          shape: {
            points: newAspLinePoints,
          },
          // style: aspirationLineStyle,
        },
      ],
    });
    console.log(chart.getOption());
  } */

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
    // let Polygon = {
    //   name: "",
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

  //TODO: step line dragging
  function updateStepLine(chart) {
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
          // y: yNew,

          // style: aspirationLineStyle,
          // transition: verticalLineTransition,
        },
      ],
    });
  }

  function updateLineShape(chart, newY) {
    //
    let oldLineComponentPoints = getLineComponent(chart, "oldAspLine").shape
      .points;
    oldLineComponentPoints[0][1] = newY;
    oldLineComponentPoints[1][1] = newY;
    if (currentIterationIndex == 0) {
      chart.setOption({
        graphic: [
          {
            id: "oldAspLine",
            // lastY: newY,
            // y: newY
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
            id: "newAspLine",
            lastY: newY,
            y: newY,
          },
        ],
      });
    }
  }

  function splitLine(chart: echarts.EChartsType) {
    //

    let oldLineComponent;
    let oldLinePoints;
    let verticalLineComponent;
    // Dont resize on the first iteration
    if (currentIterationIndex == 0) {
      return;
    }
    // else{
    //   addNewLine(chart, newX, newY);
    // }

    // Get the components of the aspiration line and the vertical line
    oldLineComponent = getLineComponent(chart, "oldAspLine");
    verticalLineComponent = getLineComponent(chart, "verticalLine");
    oldLinePoints = oldLineComponent.shape.points;

    //get the newLine
    let newAspLineComponent = getLineComponent(chart, "newAspLine");
    let newAspLinePoints = newAspLineComponent.shape.points;
    let lastY =
      newAspLineComponent.lastY < 0
        ? oldLineComponent.lastY
        : newAspLineComponent.lastY;
    if (currentIterationIndex == 1) {
      oldLinePoints[1][0] = verticalLineComponent.x;
    }
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
      // Resize the the old aspiration line(the line on the left)
      // Change the last x value of the old aspiration line points to be at the same x position as vertical line
      // oldLinePoints[1][0] = newAspLinePoints[0][0];
      newPoints = oldLinePoints.concat(betweenLine);
    }
    // let newAspLinePoints = [
    //   [verticalLineComponent.x, newY],
    //   [newX+100, newY],
    // ];
    console.log(chart.getOption().graphic[0].elements);
    chart.setOption({
      graphic: [
        {
          id: "oldAspLine",
          lastY: lastY,
          shape: {
            points: newPoints,
          },
          // draggable: false,
          // silent: true,
        },
      ],
    });
    console.log(chart.getOption().graphic[0].elements);
    // addNewLine(chart, newX, newY);
    // Update the position of the aspiration line and make it visible and draggable
  }

  function addNewLine(chart, verticalLineComponent?, oldLineComponent?) {
    // Get the components of the aspiration line and the vertical line
    verticalLineComponent = verticalLineComponent
      ? verticalLineComponent
      : getLineComponent(chart, "verticalLine");
    oldLineComponent = oldLineComponent
      ? oldLineComponent
      : getLineComponent(chart, "oldAspLine");
    const lastIndex = oldLineComponent.shape.points.length - 1;
    // const oldLineLastX = oldLineComponent.shape.points[lastIndex][0];
    const oldLineLastY = oldLineComponent.shape.points[lastIndex][1];
    const newY = oldLineComponent.lastY ? oldLineComponent.lastY : oldLineLastY;

    let newAspLinePoints = [
      [verticalLineComponent, 0],
      [chart.getModel().getComponent("xAxis").axis.grid.getRect().width, 0],
    ];
    chart.setOption({
      graphic: {
        id: "newAspLine",
        lastY: newY,
        y: newY,
        shape: {
          points: newAspLinePoints,
        },
        invisible: false,
        silent: false,
        draggable: "vertical",
      },
    });
  }

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
</script>

<button
  on:click={function () {
    // console.log(params);
    // console.log(currentIterationIndex);
    if (currentIterationIndex < maxIterations) {
      currentIterationIndex = currentIterationIndex + 1;
      navigationBars.map((chart) => {
        console.log(chart.getOption().graphic[0].elements[2]);
        updateData();
        // updateLine(chart, 0);
        updateStepLine(chart);
        if (currentIterationIndex > 0) {
          let xForVerticalLine = chart.convertToPixel({ seriesIndex: 0 }, [
            currentIterationIndex,
            0,
          ])[0];
          splitLine(chart);
          addNewLine(chart, xForVerticalLine);
        }
        chart.setOption({});
        console.log("look here");
        console.log(chart.getOption().graphic[0].elements);
        console.log(chart.getOption().graphic[0].elements[2]);
      });
    } else {
      console.log("Max iterations reached");
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
            updateLineShape(chart, newY);
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
