<!--
  @component
      @description Makes a horizontal axis plot using the ECharts library.
      TODO: Read solution data from props: make this dynamic, but for this the info of which of the solutions to show is needed
      TODO: Min Max values also to input field
      TODO: Bar chart's style depending on if the the objective is to be minimized or maximized
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  import type { SolutionData } from "./types";
  export let id: string;
  export let data: SolutionData;

  const names = data.names;
  // Array for storing aspiration values
  $: aspValues = Array(names.length);
  // TODO: What to do when there is multiple solutions already. Normally the optimization (iterationf) process starts without solutions. If there is already solutions, user may want to start from any of the solutions?
  const firstIteration = data.values[0];

  onMount(() => {
    let option: echarts.EChartOption = {
      xAxis: {
        id: "xAxis",
        type: "value",
        min: 0,
        max: 100,
        axisPointer: {
          show: true,
          lineStyle: {
            type: "solid",
            width: 3,
            color: "black",
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
      },
      graphic: {
        id: "rec",
        type: "rect",
        z: 100,
        style: {
          stroke: "red",
          lineWidth: 3,
        },
      },
    };

    for (let i = 0; i < names.length; i++) {
      addHoriBar(id + i, option, i);
    }
  });
  // $: value = 0;
  function addHoriBar(id: string, option: echarts.EChartOption, idx) {
    const chart = echarts.init(document.getElementById(id) as HTMLDivElement);
    chart.setOption(option);
    // Store the input field's id also in to the chart (Is there a better way to do this, for example does echarts have own input fields?)
    chart.setOption({
      inputIndex: idx,
      xAxis: {
        min: data.value_ranges[idx][0],
        max: data.value_ranges[idx][1],
      },
      series: {
        showBackground: true,
        backgroundStyle: {
          color: "#5c7bd9",
          opacity: 0.2,
        },
        type: "bar",
        data: [firstIteration[idx]],
        barWidth: "100%",
      },
    });
    // Add event listener which adds and updates the line on the graph.
    chart.getZr().on("click", function (params) {
      // var pointInPixel = [params.offsetX, params.offsetY];
      // var pointInGrid = chart.convertFromPixel("grid", pointInPixel);
      updateLine(params, chart);
    });
  }
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
        graphic: {
          id: "rec",
          x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
          y: gridRect.y,
          shape: {
            height: gridRect.height,
          },
          transition: "all",
        },
      };
    } else {
      chart = echarts.getInstanceByDom(params.target.nextElementSibling);
      newOption = {
        graphic: {
          id: "rec",
          x: chart.convertToPixel({ seriesIndex: 0 }, [aspValues[idx], 0])[0],
        },
      };
    }
    // const xAxisModel = chart.getModel().getComponent("axisPointer");
    // const xAxisView = chart.getViewOfComponentModel(xAxisModel);
    // const xAxisRect = xAxisView.group.getBoundingRect();
    // xAxisRect.height = chart.getHeight();
    chart.setOption(newOption);
  }
</script>

<div>
  {#each names as name, i}
    <div>
      <label for={name}>{name}</label>
      <input
        {name}
        type="text"
        bind:value={aspValues[i]}
        on:change={(par) => {
          updateLine(par, undefined, i);
        }}
      />
      <div id={id + i} style="width: 70vh; height: 25vh;" />
    </div>
  {/each}
</div>
