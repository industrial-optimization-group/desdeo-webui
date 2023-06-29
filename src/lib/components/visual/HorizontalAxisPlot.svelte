<!--
  @component
      @description Makes a horizontal axis plot using the ECharts library.
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  export let id: string;
  let chart;
  onMount(() => {
    chart = echarts.init(document.getElementById(id) as HTMLCanvasElement);
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
      graphic: {
        id: "rec",
        type: "rect",
        z: 100,
        style: {
          stroke: "red",
          lineWidth: 3,
        },
      },
      series: [
        {
          name: "Precipitation",
          type: "bar",
          data: [50],
        },
      ],
    };

    addHoriBar(id, option);
  });
  $: value = 0;
  function addHoriBar(id: string, option: echarts.EChartOption) {
    chart.setOption(option);
    // Add event listener which adds and updates the line on the graph.
    chart.getZr().on("click", function (params) {
      // var pointInPixel = [params.offsetX, params.offsetY];
      // var pointInGrid = chart.convertFromPixel("grid", pointInPixel);
      updateLine(params);
    });
  }
  function updateLine(params?) {
    if (params.type === "click") {
      value = chart.convertFromPixel({ seriesIndex: 0 }, [
        params.offsetX,
        params.offsetY,
      ])[0];
    }
    const gridModel = chart.getModel().getComponent("grid");
    const gridView = chart.getViewOfComponentModel(gridModel);
    const gridRect = gridView.group.getBoundingRect();
    // const xAxisModel = chart.getModel().getComponent("axisPointer");
    // const xAxisView = chart.getViewOfComponentModel(xAxisModel);
    // const xAxisRect = xAxisView.group.getBoundingRect();
    // xAxisRect.height = chart.getHeight();
    chart.setOption({
      grid: {
        show: true,
        // height: chart.getHeight(),
        // width: chart.getWidth(),
        // position: [0,0]
      },
      graphic: {
        id: "rec",
        x: chart.convertToPixel({ seriesIndex: 0 }, [value, 0])[0],
        // top: "center",
        y: gridRect.y,
        shape: {
          height: gridRect.height,
        },
        transition: "all",
      },
    });
  }
</script>

<div>
  <input type="text" bind:value on:change={updateLine} />
  <div {id} style="width: 70vh; height: 25vh;" />
</div>
