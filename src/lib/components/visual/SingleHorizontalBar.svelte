<!--
  @component
      @description Makes a single horizontal using the ECharts library.

-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import type { SolutionData } from "./types";
  import { colorPalette } from "./stores";
  // export let id: string;

  // function to which returns the aspiration values
  // export function getAspirationValues() {
  //   return aspValues;
  // }

  export let lowerBound: number;
  export let higherBound: number;
  export let selectedValue: number;
  export let previousValue = 0;
  // export let isMin = true;
  export let colorPaletteIndex = 0;
  export let divId: string;
  export function updateSelected() {
    updateLine();
  }
  // $: selectedValue

  // const errColor = "red";
  const arrowSize = 15;
  const arrowColor = "black";

  let chart: echarts.EChartsType;
  const solutionValue = selectedValue;

  // Create the option object for the whole chart.
  let option: echarts.EChartOption = {
    xAxis: {
      axisLabel: {
        margin: 5,
        lineHeight: 10,
      },
      axisLine: {
        show: false,
      },
      id: "xAxis",
      type: "value",
      axisPointer: {
        show: true,
        lineStyle: {
          type: "solid",
          width: 3,
          color: "black",
        },
      },
      splitLine: {
        lineStyle: {
          color: "black",
          opacity: 0.2,
        },
      },
    },
    yAxis: {
      id: "yAxis",
      type: "category",
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    grid: {
      show: true,
      borderWidth: 1,
      borderColor: "gray",
      left: arrowSize * 2,
      right: arrowSize * 2,
      top: arrowSize,
      bottom: arrowSize,
    },
  };

  onMount(() => {
    chart = echarts.init(document.getElementById(divId) as HTMLDivElement);
    addHorizontalBar(option);
  });

  function addHorizontalBar(
    option: echarts.EChartOption
    // id?: string,
    // idx?: number
  ) {
    chart.setOption(option);
    chart.setOption({
      // Set the min max values for the bar
      xAxis: {
        min: lowerBound,
        max: higherBound,
      },
      // Set the color of the bar
      series: {
        color: colorPalette[colorPaletteIndex],
        showBackground: true,
        backgroundStyle: {
          color: colorPalette[colorPaletteIndex],
          opacity: 0.2,
        },
        type: "bar",
        data: [selectedValue],
        barWidth: "100%",
      },
    });

    // TODO: How to get the gridRect without using the private methods?
    const gridModel = chart.getModel().getComponent("grid");
    const gridView = chart.getViewOfComponentModel(gridModel);
    const gridRect = gridView.group.getBoundingRect();

    // This option adds the interactive custom graphic elements to the chart
    const graphicOptions = {
      graphic: [
        // Add aspiration value line
        {
          id: "rec",
          type: "rect",
          x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          y: gridRect.y,
          z: 100,
          transition: "all",
          shape: {
            height: gridRect.height,
          },
          style: {
            stroke: "red",
            lineWidth: 3,
          },
        },

        // Add a line for previous preference
        {
          id: "prev_line",
          type: "rect",
          x: chart.convertToPixel({ seriesIndex: 0 }, [previousValue, 0])[0],
          y: gridRect.y,
          z: 5,
          transition: "all",
          shape: {
            height: gridRect.height,
          },
          style: {
            stroke: "blue",
            lineDash: [4],
            lineWidth: 3,
          },
        },
        {
          id: "verticalGroup",
          type: "group",
          name: "interactiveButtons",
          children: [
            // Add a button (arrow) to reset the aspiration value to the solution value.
            {
              id: "arrow",
              type: "polygon",
              // group: "test",
              x: chart.convertToPixel({ seriesIndex: 0 }, [
                selectedValue,
                0,
              ])[0],
              shape: {
                points: [
                  [-arrowSize, 0],
                  [arrowSize, 0],
                  [0, arrowSize],
                ],
              },
              style: {
                fill: arrowColor,
              },
              onclick: () => {
                selectedValue = solutionValue;
                updateLine();
              },
            },
          ],
        },
        // Add arrows
        {
          id: "leftRightGroup",
          type: "group",
          top: "center",
          name: "interactiveButtons",
          children: [
            //Left Arrow
            {
              type: "polygon",
              id: "left",

              shape: {
                points: [
                  [-1, arrowSize],
                  [-1, -arrowSize],
                  [-arrowSize, 0],
                ],
              },
              style: {
                fill: arrowColor,
              },
              left: 0,
            },
            // Right Arrow
            {
              type: "polygon",
              id: "right",
              shape: {
                points: [
                  [1, arrowSize],
                  [1, -arrowSize],
                  [arrowSize, 0],
                ],
              },
              style: {
                fill: arrowColor,
              },
              left: chart.getWidth() - arrowSize,
            },
          ],
          // onclick event for the arrows
          onclick: (params: { target: { id: string } }) => {
            const targetId = params.target.id;
            if (targetId === "left") {
              selectedValue = lowerBound;
            } else if (targetId === "right") {
              selectedValue = higherBound;
            }
            updateLine();
          },
        },
        // Invisible rectangle for the whole grid area, so that clicking on the grid area works correctly
        {
          type: "rect",
          shape: {
            x: gridRect.x,
            y: gridRect.y,
            width: gridRect.width,
            height: gridRect.height,
          },
          style: {
            fill: "transparent",
            stroke: "transparent",
            lineWidth: 0,
          },
        },
      ],
    };
    chart.setOption(graphicOptions);
    // Add event listener which adds and updates the aspiration line on the graph.
    chart.getZr().on("click", function (params) {
      if (params.target == null) {
        return;
      }
      const targetParentName: string = params.target.parent.name;
      // Only update the line if click has not happened on the interactive buttons
      if (targetParentName !== "interactiveButtons") {
        updateLine(params);
        return;
      }
    });
  }

  /**
   * Updates the aspiration (preference) line on the graph.
   *
   * @param params The parameters of the click event.
   * @param chart The chart object.
   * @param idx The index of the input field value. TODO: make default chart
   *   type
   */
  function updateLine(params?: echarts.ElementEvent | Event) {
    let newOption = {};
    let chartDiv: HTMLDivElement | HTMLCanvasElement;
    // let chart: echarts.ECharts;
    if (params != null) {
      if (params instanceof Event) {
        const target = params.target as HTMLInputElement | null;
        const parentElem = target?.parentElement;
        if (!target || !parentElem) {
          return;
        }
        chartDiv = target.parentElement.nextElementSibling as HTMLDivElement;
        chart = echarts.getInstanceByDom(chartDiv);
        newOption = {
          graphic: {
            id: "rec",
            x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          },
        };
      } else {
        chartDiv = (params.event.currentTarget as HTMLDivElement)
          .parentElement as HTMLDivElement;
        chart = echarts.getInstanceByDom(chartDiv);
        selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
          params.offsetX,
          params.offsetY,
        ])[0];
        newOption = {
          graphic: [
            {
              id: "rec",
              x: chart.convertToPixel({ seriesIndex: 0 }, [
                selectedValue,
                0,
              ])[0],
            },
          ],
        };
      }
    } else {
      newOption = {
        graphic: [
          {
            id: "rec",
            x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          },
        ],
      };
    }

    // let errorP = document
    //   .querySelectorAll(".bar_container")
    //   [idx].querySelector(".error");
    // if (errorP != null) {
    //   (errorP.previousElementSibling as HTMLElement).style.borderColor = "";
    //   errorP.remove();
    // }

    chart.setOption(newOption);
  }

  // /**
  //  * Handles the onchange event of the input fields. Updates the graph and the
  //  * aspiration value.
  //  *
  //  * @param param
  //  * @param i
  //  */
  // function handleOnchange(param: Event, i: number) {
  //   const targetElem = param.target as HTMLInputElement | null;
  //   const parentElem = targetElem?.parentElement;
  //   if (!targetElem || !parentElem) {
  //     return;
  //   }
  //   // Update the line only when the input value is valid
  //   if (targetElem.checkValidity()) {
  //     updateLine(param);
  //     console.log(targetElem.style);
  //     targetElem.style.borderColor = "";
  //     const errElem = parentElem.querySelector(".error");
  //     if (errElem !== null) {
  //       errElem.remove();
  //     }
  //   } else {
  //     if (parentElem.querySelector(".error") != null) {
  //       return;
  //     }
  //     targetElem.style.borderColor = errColor;
  //     var oNewP = document.createElement("p");
  //     oNewP.setAttribute("class", "error");
  //     oNewP.appendChild(
  //       document.createTextNode(
  //         `Value must be on the range of ${data.value_ranges[i][0]} - ${data.value_ranges[i][1]}`
  //       )
  //     );
  //     oNewP.style.color = errColor;
  //     targetElem.insertAdjacentElement("afterend", oNewP);
  //   }
  // }
</script>
