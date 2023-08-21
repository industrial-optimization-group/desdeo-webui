<script lang="ts">
  // import type * as echarts from "echarts";
  import type { EChartOption } from "echarts";
  import EchartsComponent from "$lib/components/visual/general/EchartsComponent.svelte";

  // export let values: number[][];

  //A basic paraller axis chart with dummy data
  let option: EChartOption = {
    parallelAxis: [
      { dim: 0, name: "Price" },
      { dim: 1, name: "Net Weight" },
      { dim: 2, name: "Amount" },
      {
        dim: 3,
        name: "Score",
        type: "category",
        data: ["Excellent", "Good", "OK", "Bad"],
      },
    ],
    series: [
      {
        type: "parallel",
        lineStyle: {
          width: 4,
        },
        data: [
          [12.99, 100, 82, "Good"],
          [9.99, 80, 77, "OK"],
          [20, 120, 60, "Excellent"],
        ],
      },
    ],
  };

  // let option = {
  // //   color: colorPalette,
  //   tooltip: {
  //     // TODO: Check if there is better way to achiece no type errors, check https://github.com/apache/echarts/issues/14723
  //     formatter: function (params) {
  //       let newParams: EChartOption.Tooltip.Format =
  //         params as EChartOption.Tooltip.Format;
  //       let result = newParams.name + "<br>";
  //       for (let i = 0; i < newParams.data.value.length; i++) {
  //         result += newParams.data.value[i] + "<br>";
  //       }
  //       return result;
  //     },
  //   },
  //   parallel: {
  //     parallelAxisDefault: {
  //       axisTick: {
  //         show: false,
  //         length: 0.8,
  //         // length: -2,
  //         lineStyle: {
  //           cap: "round",
  //           width: 4,
  //         },
  //       },
  //       axisLabel: {
  //         inside: true,
  //       },
  //     },
  //   },
  //   parallelAxis: createParallelAxisOption(),
  //   toolbox: { show: false },
  //   brush: {
  //     brushMode: "multiple",
  //     throttleType: "debounce",
  //     throttleDelay: 300,
  //   },
  //   series: [
  //     {
  //       silent: disableInteraction,
  //       type: "parallel",
  //       lineStyle: lineStyle,
  //       selectedMode: "multiple",
  //       // TODO: Implement changing line color without using select. Now select causes type error, thus the ts-ignore. For some reason parallel axis does not have select property, but for example bar charts have:https://echarts.apache.org/en/option.html#series-bar.select, parallel: https://echarts.apache.org/en/option.html#series-parallel
  //       //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
  //       select: {
  //         lineStyle: selectedLineStyle,
  //       },
  //       emphasis: {
  //         lineStyle: hoverLineStyle,
  //       },
  //       // colorBy: "series",
  //       data: seriesData,
  //     },
  //   ],
  //   graphic: createGraphicData(),
  // };
</script>

<EchartsComponent {option} />
