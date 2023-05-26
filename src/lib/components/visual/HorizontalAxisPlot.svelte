<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  // const rivinNimi = ["testi"];
  // const kolumniNimet = [1, 2, 3, 4, 5, 6, 7];
  onMount(() => {
    const chart = echarts.init(
      document.getElementById("HorizontalAxisPlot") as HTMLCanvasElement
    );
    let option: echarts.EChartOption = {
      // tooltip:{
      //   trigger: 'axis',
      // },
      // backgroundColor: "white",
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

    // let option: echarts.EChartOption = {

    //   title: [{
    //     text: rivinNimi[0],
    //   }],
    //   tooltip: {
    //     trigger: 'axis',
    //     axisPointer: {
    //       type: "line",
    //       snap: false,
    //     }
    //   },
    //   singleAxis: {
    //     name: "test",
    //     type: 'value',
    //     data: kolumniNimet
    //   },
    //   series: [{
    //     // singleAxisIndex: 0,
    //     name: 'scatter',
    //     type: 'line',
    //     coordinateSystem: 'cartesian',
    //     symbolSize: 20,
    // data: [1.1231313,2],
    //     // coordinateSystem: 'cartesian',
    //     // coordinateSystem: 'cartesian2d',
    //   }],
    // }

    chart.setOption(option);

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
