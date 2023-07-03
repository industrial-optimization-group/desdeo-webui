<!--
  @component
      @description Makes a horizontal axis plot using the ECharts library.
      TODO: Read solution data from props: make this dynamic, but for this the info of which of the solutions to show is needed
      TODO: (Is it necessary?)Bar chart's style depending on if the the objective is to be minimized or maximized
      TODO: Set default position for the aspiration value line when the component is created (to the solution value)
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  import type { SolutionData } from "./types";
  import { colorPalette } from "./stores";
  export let id: string;
  export let data: SolutionData;

  const errColor = "red";
  const arrowSize = 15;
  const arrowColor = "black";
  const names = data.names;
  // Array for storing aspiration values
  $: aspValues = Array(names.length);
  // TODO: What to do when there is multiple solutions already. Normally the optimization (iterationf) process starts without solutions. If there is already solutions, user may want to start from any of the solutions?
  const firstIteration = data.values[0];

  onMount(() => {
    // Create the option object for the whole chart.
    let option: echarts.EChartOption = {
      xAxis: {
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
      },
      grid: {
        show: true,
        borderWidth: 1,
        borderColor: "gray",
        left: arrowSize * 2,
        right: arrowSize * 2,
        top: 0,
        bottom: 0,
      },
    };
    // Add the horizontal bars dynamically, adds as many bars as there is objectives
    for (let i = 0; i < names.length; i++) {
      addHoriBar(id + i, option, i);
    }
  });

  /**
   * Adds a horizontal bar to the chart.
   *
   * @param id The id of the div element where the chart is rendered.
   * @param option
   * @param idx
   */
  function addHoriBar(id: string, option: echarts.EChartOption, idx: number) {
    const chart = echarts.init(document.getElementById(id) as HTMLDivElement);
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

    // This setOptions adds the aspiration value line and the arrows
    chart.setOption({
      graphic: [
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
        // Add aspiration value line
        {
          id: "rec",
          type: "rect",
          z: 100,
          style: {
            stroke: "red",
            lineWidth: 3,
          },
        },
        // Add arrows
        {
          type: "group",
          top: "center",
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
          //TODO: set the value how much the value changes when the arrow is clicked to be dynamic
          onclick: (params) => {
            const targetId = params.target.id;
            if (targetId === "left") {
              aspValues[idx] -= 1;
            } else if (targetId === "right") {
              aspValues[idx] += 1;
            }
            const inputField = document.getElementsByName(names[idx])[0];
            inputField.value = aspValues[idx];
            inputField.dispatchEvent(new Event("change"));
          },
        },
      ],
    });
    // Add event listener which adds and updates the aspiration line on the graph.
    chart.getZr().on("click", function (params) {
      if (params.target == null) {
        return;
      }
      const targetId: number | string = params.target.id;
      // Only update the line if the click is on the grid area
      if (
        !(targetId === "left" || targetId === "right" || targetId === "rec")
      ) {
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
   * @param idx The index of the input field value.
   */
  function updateLine(params?, chart?, idx?) {
    let newOption;
    if (params.type === "click") {
      //Get the index of the input field value
      idx = chart.getOption().inputIndex;
      aspValues[idx] = chart.convertFromPixel({ seriesIndex: 0 }, [
        params.offsetX,
        params.offsetY,
      ])[0];
      const gridModel = chart.getModel().getComponent("grid");
      const gridView = chart.getViewOfComponentModel(gridModel);
      const gridRect = gridView.group.getBoundingRect();
      newOption = {
        graphic: [
          {
            id: "rec",
            x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
            y: gridRect.y,
            shape: {
              height: gridRect.height,
            },
            transition: "all",
          },
        ],
      };
    } else {
      chart = echarts.getInstanceByDom(
        params.target.parentElement.querySelector("div")
      );
      newOption = {
        graphic: {
          id: "rec",
          x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
        },
      };
    }
    chart.setOption(newOption);
  }

  function handle(par, i: number) {
    const targetElem: HTMLInputElement = par.target;
    // Update the line only when the input value is valid
    if (targetElem.checkValidity()) {
      updateLine(par, undefined, i);
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
    <div>
      {#if data.minimize[i]}
        <p>{name} (minimize)</p>
      {:else}
        <p>{name} (maximize)</p>
      {/if}
      <label for={name}>Aspiration level</label>
      <input
        {name}
        type="number"
        min={data.value_ranges[i][0]}
        max={data.value_ranges[i][1]}
        step="any"
        bind:value={aspValues[i]}
        on:change={(par) => handle(par, i)}
      />
      <div id={id + i} style="width: 70vh; height: 25vh; min-height: 200px" />
    </div>
  {/each}
</div>
