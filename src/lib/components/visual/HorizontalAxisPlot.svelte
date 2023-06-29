<!--
  @component
      @description Makes a horizontal axis plot using the ECharts library.
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  export let id: string;

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
      series: [
        {
          showBackground: true,
          backgroundStyle: {
            color: "#5c7bd9",
            opacity: 0.2,
          },
          name: "Precipitation",
          type: "bar",
          data: [50],
          barWidth: "100%",
        },
      ],
    };

    for (let i = 0; i < 3; i++) {
      addHoriBar(id + i, option);
    }
    // addHoriBar(id, option);
  });
  $: value = 0;
  function addHoriBar(id: string, option: echarts.EChartOption) {
    const chart = echarts.init(document.getElementById(id) as HTMLDivElement);
    chart.setOption(option);
    // Add event listener which adds and updates the line on the graph.
    chart.getZr().on("click", function (params) {
      // var pointInPixel = [params.offsetX, params.offsetY];
      // var pointInGrid = chart.convertFromPixel("grid", pointInPixel);
      updateLine(params, chart);
    });
    return chart;
  }
  function updateLine(params?, chart?) {
    let newOption;
    if (params.type === "click") {
      value = chart.convertFromPixel({ seriesIndex: 0 }, [
        params.offsetX,
        params.offsetY,
      ])[0];
      const gridModel = chart.getModel().getComponent("grid");
      const gridView = chart.getViewOfComponentModel(gridModel);
      const gridRect = gridView.group.getBoundingRect();
      newOption = {
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
      };
    } else {
      chart = echarts.getInstanceByDom(params.target.nextElementSibling);
      newOption = {
        graphic: {
          id: "rec",
          x: chart.convertToPixel({ seriesIndex: 0 }, [value, 0])[0],
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
  {#each { length: 3 } as i}
    <div>
      <input type="text" bind:value on:change={updateLine} />
      <div id={id + i} style="width: 70vh; height: 25vh;" />
    </div>
  {/each}
</div>
