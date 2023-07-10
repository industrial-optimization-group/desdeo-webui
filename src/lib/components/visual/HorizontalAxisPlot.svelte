<!--
  @component
      @description Makes a horizontal axis plot using the ECharts library.
      TODO: Read solution data from props: make this dynamic, but for this the info of which of the solutions to show is needed
      TODO: (Is it necessary?)Bar chart's style depending on if the the objective is to be minimized or maximized
      TODO: Link previous preference value 
      TODO: Fix hard coded aspiration array
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  import type { SolutionData } from "./types";
  import { colorPalette } from "./stores";
  export let id: string;
  export let data: SolutionData;
  // function to which returns the aspiration values
  export function getAspirationValues() {
    return aspValues;
  }

  const errColor = "red";
  const arrowSize = 15;
  const arrowColor = "black";
  const names: string[] = data.names;
  // Array for storing aspiration values

  // TODO: What to do when there is multiple solutions already. Normally the optimization (iterationf) process starts without solutions. If there is already solutions, user may want to start from any of the solutions?
  const firstIteration: number[] = data.values[0];
  const fakePreviousIteration: number[] = data.values[1];
  $: aspValues = firstIteration.slice();
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
    // Add the horizontal bars dynamically, adds as many bars as there is objectives
    for (let i = 0; i < names.length; i++) {
      addHorizontalBar(id, option, i);
    }
    const inputs = document.getElementsByClassName("asp_input");
    for (let idx = 0; idx < inputs.length; idx++) {
      const input = inputs[idx];
      input.value = aspValues[idx].toString();
      input.dispatchEvent(new Event("change"));
    }
  });

  /**
   * Adds a horizontal bar to the chart.
   *
   * @param id The id of the div element where the chart is rendered.
   * @param option
   * @param idx
   */
  function addHorizontalBar(
    id: string,
    option: echarts.EChartOption,
    idx: number
  ) {
    const chart = echarts.init(
      document.getElementById(id + idx) as HTMLDivElement
    );
    chart.setOption(option);
    chart.setOption({
      inputIndex: idx,
      // Set the min max values for the bar
      xAxis: {
        min: data.value_ranges[idx][0],
        max: data.value_ranges[idx][1],
      },
      // Set the color of the bar
      series: {
        color: colorPalette[idx],
        showBackground: true,
        backgroundStyle: {
          color: colorPalette[idx],
          opacity: 0.2,
        },
        type: "bar",
        data: [firstIteration[idx]],
        barWidth: "100%",
      },
    });

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
          x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
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
          x: chart.convertToPixel({ seriesIndex: 0 }, [
            fakePreviousIteration[idx],
            0,
          ])[0],
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
                aspValues[idx],
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
                const inputField = document.getElementsByName(
                  names[idx]
                )[0] as HTMLInputElement;
                aspValues[idx] = firstIteration[idx];
                inputField.value = aspValues[idx].toString();
                inputField.dispatchEvent(new Event("change"));
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
              aspValues[idx] = data.value_ranges[idx][0];
            } else if (targetId === "right") {
              aspValues[idx] = data.value_ranges[idx][1];
            }
            const inputField = document.getElementsByName(
              names[idx]
            )[0] as HTMLInputElement;
            inputField.value = aspValues[idx].toString();
            inputField.dispatchEvent(new Event("change"));
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
        updateLine(params, chart, idx);
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
  function updateLine(
    params: echarts.ElementEvent,
    chart: echarts.EChartsType,
    idx: number
  ) {
    let newOption;
    if (params.type === "click") {
      //Get the index of the input field value
      // TODO: .inputIndex is a custom property that's why the type error. How to implement this differently, so that there is no need for the custom property
      idx = chart.getOption().inputIndex;
      aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
        params.offsetX,
        params.offsetY,
      ])[0];
      newOption = {
        graphic: [
          {
            id: "rec",
            x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
          },
        ],
      };
    } else {
      chart = echarts.getInstanceByDom(
        params.target.parentElement.nextElementSibling
      );
      newOption = {
        graphic: {
          id: "rec",
          x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
        },
      };
    }
    let errorP = document
      .querySelectorAll(".bar_container")
      [idx].querySelector(".error");
    if (errorP != null) {
      (errorP.previousElementSibling as HTMLElement).style.borderColor = "";
      errorP.remove();
    }
    chart.setOption(newOption);
  }

  /**
   * Handles the onchange event of the input fields. Updates the graph and the
   * aspiration value.
   *
   * @param param
   * @param i
   */
  function handleOnchange(
    param: Event & { currentTarget: EventTarget & HTMLInputElement },
    i: number
  ) {
    const targetElem: HTMLInputElement = param.target;
    // Update the line only when the input value is valid
    if (targetElem.checkValidity()) {
      updateLine(param, undefined, i);
      console.log(targetElem.style);
      targetElem.style.borderColor = "";
      if (targetElem.parentElement.querySelector(".error") != null) {
        targetElem.parentElement.querySelector(".error").remove();
      }
    } else {
      if (targetElem.parentElement.querySelector(".error") != null) {
        return;
      }
      targetElem.style.borderColor = errColor;
      var oNewP = document.createElement("p");
      oNewP.setAttribute("class", "error");
      oNewP.appendChild(
        document.createTextNode(
          `Value must be on the range of ${data.value_ranges[i][0]} - ${data.value_ranges[i][1]}`
        )
      );
      oNewP.style.color = errColor;
      targetElem.insertAdjacentElement("afterend", oNewP);
    }
  }
</script>

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
          on:change={(par) => handleOnchange(par, i)}
        />
        <label for="prev">Previous preference </label>
        <input
          type="number"
          name="prev"
          placeholder="2.543"
          readonly
          style="border: 0; box-shadow: none;background-color: rgba(232 234 241);"
        />
      </div>
      <div
        id={id + i}
        class="chart_div"
        style="width: 70vh; height: 2vh; min-height: 100px; margin-left:2em"
      />
    </div>
  {/each}
</div>
