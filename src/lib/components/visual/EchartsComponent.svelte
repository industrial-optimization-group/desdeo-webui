<script lang="ts">
  import * as echarts from "echarts";
  import type { EChartOption, EChartsType } from "echarts";
  import { onMount } from "svelte";

  export let chart: EChartsType | undefined = undefined;
  export let option: EChartOption;
  export let events:
    | {
        [key: string]: (params: {
          dataIndex: number;
          componentType: string;
          seriesIndex: number;
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
    } else {
      chart.resize();
    }
  });
</script>

<div style="height:100%; width:100%" bind:this={chartDiv} />
