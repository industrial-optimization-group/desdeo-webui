<script lang="ts">
  import * as echarts from "echarts";
  import type { EChartOption, EChartsType } from "echarts";
  import { onMount } from "svelte";
  // import { highlightedStyle } from "../constants";

  export let colors: string[] = [];
  export let chart: EChartsType | undefined = undefined;
  export let option: EChartOption;
  export let disableAnimation = true;
  export let aspectRatio: number | string = 5 / 3;
  export let customStyle = "height: 100%; width: 100%;";
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

  if (typeof aspectRatio === "number") {
    aspectRatio = aspectRatio.toString();
  }
  let aspectString = "aspect-ratio:" + aspectRatio + ";" + customStyle;

  onMount(() => {
    if (!chart) {
      chart = echarts.init(chartDiv, "", { renderer: "svg" });
      chart.setOption(option);
      chart.setOption({
        color: colors,
        // TODO: solve type error
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -- Error says that colorBy doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property (v.5.2.0), so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.colorBy
        colorBy: "data",
        animation: !disableAnimation,
      });
    } else {
      chart.resize();
    }
    // chartDiv.setAttribute("style", aspectString);
  });
</script>

<div class="aspect-[5/3]" style={aspectString} bind:this={chartDiv} />
