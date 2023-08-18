<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  import type * as echarts from "echarts";
  import type { EChartOption } from "echarts";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "$lib/components/visual/chartStore";
  import { selectedLineStyle } from "$lib/components/visual/stores";
  import {
    handleClickSelection,
    handleSelectionChange,
    handleHighlightChange,
  } from "$lib/components/visual/helperFunctions";
  import EchartsComponent from "$lib/components/visual/EchartsComponent.svelte";

  export let values: number[][];
  // export let minimize: boolean[];
  // export let showIndicators = false;
  export let indicatorNames: string[] = []; // At the moment breaks the graphics if not given the same amount as values (objectives/axis)
  export let selectedIndices: number[] = [];
  export let highlightedIndices: number | undefined = undefined;
  // export let data: SolutionData;

  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices);
    }
  }

  $: {
    if (chart) {
      handleHighlightChange(chart, highlightedIndices);
    }
  }

  // const names: string[] = data.names;
  // const values: number[][] = data.values;

  // Create the indicator objects for the radar chart.
  let indObjects: { name: string }[] = [];
  indicatorNames.forEach((name) => {
    indObjects.push({ name: name });
  });
  // Create the series data for the radar chart.
  let seriesData: { value: number[]; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
  }

  // Create the option object for the whole chart.
  const option: EChartOption = {
    tooltip: {},
    radar: {
      shape: "circle",
      indicator: indObjects,
    },
    series: [
      {
        symbol: "none",
        type: "radar",
        selectedMode: "multiple",
        // TODO: Select has type error:Object literal may only specify known properties, and 'select' does not exist in type 'SeriesLine | SeriesPie | SeriesScatter | SeriesEffectScatter | SeriesRadar | SeriesTree | ... 14 more ... | SeriesCustom
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
        select: {
          lineStyle: selectedLineStyle,
        },
        emphasis: {
          lineStyle: {
            width: 5,
            opacity: 1,
          },
        },
        data: seriesData,
      },
    ],
  };

  let events = {
    click: function (params: {
      dataIndex: number;
      componentType: string;
      seriesIndex: number;
    }) {
      console.log(params);
      selectedIndices = handleClickSelection(params, selectedIndices);
    },
    mouseover: function (params: { dataIndex: number }) {
      highlightedIndices = params.dataIndex;
    },
    mouseout: function () {
      highlightedIndices = undefined;
    },
  };
</script>

<EchartsComponent {option} bind:chart bind:events />