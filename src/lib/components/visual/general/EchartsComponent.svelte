<script lang="ts">
  import * as echarts from "echarts";
  import type { EChartOption, EChartsType } from "echarts";
  import { onMount } from "svelte";
  import { colorPalette } from "../constants";

  export let colors = colorPalette;
  export let chart: EChartsType | undefined = undefined;
  export let option: EChartOption;
  export let events:
    | {
        [key: string]: (params: {
          dataIndex: number;
          componentType: string;
          seriesIndex: number;
          intervals: number[][];
          data: { value: number[] };
        }) => void;
      }
    | undefined = undefined;
  let chartDiv: HTMLDivElement;
  $: if (events) {
    if (chart) {
      for (const [eventName, eventHandler] of Object.entries(events)) {
        chart.on(eventName, eventHandler);
        chart = chart;
      }
    }
  }
  onMount(() => {
    if (!chart) {
      chart = echarts.init(chartDiv, "", { renderer: "svg" });
      chart.setOption(option);
      chart.setOption({
        color: colors,
      });
    } else {
      chart.resize();
    }
  });
</script>

<div style="height:100%; width:100%" bind:this={chartDiv} />
