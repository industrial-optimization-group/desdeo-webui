<!--
  @component
      @description Makes a horizontal axis plot using the ECharts library.
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  onMount(() => {
    const chart = echarts.init(
      document.getElementById("HorizontalAxisPlot") as HTMLCanvasElement
    );
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
    chart.setOption(option);

    // Add event listener which adds and updates the line on the graph.
    chart.getZr().on("click", function (params) {
      // var pointInPixel = [params.offsetX, params.offsetY];
      // var pointInGrid = chart.convertFromPixel("grid", pointInPixel);
      chart.setOption({
        graphic: {
          id: "rec",
          x: params.offsetX,
          shape: {
            height: chart.getHeight(),
          },
        },
      });
    });
  });
</script>

<div id="HorizontalAxisPlot" />

<style>
  #HorizontalAxisPlot {
    width: 70vw;
    height: 30vh;
  }
</style>
