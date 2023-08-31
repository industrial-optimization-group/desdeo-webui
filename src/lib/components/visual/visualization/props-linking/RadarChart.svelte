<!--@component
    @description Makes a radar chart using the ECharts library.
-->
<!-- TODO: Add min/max indicator arrows -->
<script lang="ts">
  import type * as echarts from "echarts";
  import type { EChartOption } from "echarts";
  import {
    colorPalette,
    selectedLineStyle,
  } from "$lib/components/visual/constants";
  import {
    handleClickSelection,
    handleSelectionChange,
    handleHighlightChange,
  } from "$lib/components/visual/helperFunctions";
  import EchartsComponent from "$lib/components/visual/general/EchartsComponent.svelte";

  /** The colors to use for the chart. */
  export let colors: string[] = [colorPalette[0]];

  /** The values to use for the chart. */
  export let values: number[][];

  /**
   * The names to use for the indicators (axis).
   *
   * @remarks
   *   At the moment breaks the graphics if not given the same amount as values
   *   (objectives/axis).
   */
  export let indicatorNames: string[] = [];

  /** The indices of the selected items in the chart. */
  export let selectedIndices: number[] = [];

  /** The index of the highlighted item in the chart. */
  export let highlightedIndex: number | undefined = undefined;

  /** The maximum number of items that can be selected in the chart. */
  export let maxSelections: number | undefined = undefined;

  /** If true, the animation of the chart will be disabled. */
  export let disableAnimation: boolean | undefined = undefined;

  /** The aspect ratio of the div container, which contains the chart. */
  export let aspect: string | undefined = "aspect-[5/3]";

  // export let lowerIsBetter: boolean[];

  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices, maxSelections);
    }
  }

  $: {
    if (chart) {
      handleHighlightChange(chart, highlightedIndex);
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
      scale: true,
      axisLabel: {
        show: true,
      },
    },
    color: colors,
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
        data: seriesData,
      },
    ],
  };

  let events = {
    click: function (params: {
      dataIndex: number;
      componentType: string;
      seriesIndex: number;
      data: { value: number[] };
    }) {
      selectedIndices = handleClickSelection(
        chart,
        params,
        selectedIndices,
        maxSelections
      );
    },
    mouseover: function (params: { dataIndex: number }) {
      highlightedIndex = params.dataIndex;
    },
    mouseout: function () {
      highlightedIndex = undefined;
    },
  };
</script>

<EchartsComponent
  {option}
  bind:chart
  bind:events
  {colors}
  {disableAnimation}
  {aspect}
/>
