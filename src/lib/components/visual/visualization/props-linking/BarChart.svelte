<!--@component
    @description Makes a petal chart using the ECharts library's pie option.
-->
<!-- TODO: Values on the x-axis too tight -->
<script lang="ts">
  import type * as echarts from "echarts";
  import { handleSelectionChange } from "$lib/components/visual/helperFunctions";
  import EchartsComponent from "../../general/EchartsComponent.svelte";
  import { selectedLineStyle } from "../../constants";

  export let title = "";
  export let colors: string[] = [];
  export let values: number[];
  export let axisNames: string[] = [];
  export let selectedIndices: number[] = [];
  export let highlightedIndex: number | undefined = undefined;
  export let componentIndex: number | undefined = undefined;
  export let maxSelections: number | undefined = undefined;
  export let disableAnimation: boolean | undefined = undefined;
  export let aspect: string | undefined = undefined;
  export let lowerIsBetter: boolean[] | undefined = undefined;

  $: if (selectedIndices != undefined) {
    if (componentIndex != undefined) {
      if (selectedIndices.includes(componentIndex)) {
        if (chart) {
          chart.setOption({
            series: [
              {
                type: "bar",
                selectedMode: "series",
              },
            ],
          });
          chart.dispatchAction({
            type: "select",
            seriesIndex: 0,
            dataIndex: 0,
          });
        }
      } else {
        if (chart) {
          chart.setOption({
            series: [
              {
                type: "bar",
                selectedMode: false,
              },
            ],
          });
        }
      }
    }
  }
  $: {
    if (chart) {
      if (componentIndex === highlightedIndex) {
        // highlightedIndex = -1;
        chart.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
        });
      } else {
        chart.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
        });
      }
    }
  }

  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices, maxSelections);
    }
  }

  // Create the series data for the radar chart and the data for the markLines (They indicate if lower or higher value is better).
  let markLineData = [];
  let seriesData: { value: number; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({
      value: values[i],
      name: axisNames[i],
    });

    if (lowerIsBetter != undefined) {
      let formatter = lowerIsBetter[i] ? "min" : "max"; //Label text to indicate min/max
      let position = lowerIsBetter[i] ? "start" : "end";
      markLineData.push([
        // Arrow to indicate that a lower value is better
        {
          x: "10%",
          yAxis: i,
          label: { show: true, position: position, formatter: formatter },
          symbol: lowerIsBetter[i] ? "arrow" : "none",
        },
        // Arrow to indicate that a higher value is better
        {
          x: "90%",
          yAxis: i,
          label: { show: true, position: position, formatter: formatter },
          symbol: lowerIsBetter[i] ? "none" : "arrow",
        },
      ]);
    }
  }

  let dataSet: (string | number)[][] = [["Objective", ...values]];
  // Create the option object for the whole chart.
  const option: echarts.EChartOption = {
    title: {
      show: true,
      text: title,
      left: "center",
    },
    tooltip: {
      show: true,
      trigger: "item",
      formatter: "{c}",
    },

    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    dataset: {
      source: dataSet,
    },
    series: [
      {
        type: "bar",
        // roseType: "area",
        // coordinateSystem: "polar",
        // radius: ["10%", "90%"],
        label: {
          show: true,
          position: "insideLeft",

          formatter: "{b}",
        },
        selectedMode: "series",
        selectedOffset: 0,
        // TODO: Select has type error:Object literal may only specify known properties, and 'select' does not exist in constantsSeriesLine | SeriesPie | SeriesScatter | SeriesEffectScatter | SeriesRadar | SeriesTree | ... 14 more ... | SeriesCustom
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property (ECharts 5.0.0), so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
        select: {
          itemStyle: {
            borderColor: selectedLineStyle.color,
            borderWidth: 3,
          },
        },
        data: seriesData,
        markLine: {
          lineStyle: {
            color: "black",
            width: 0,
            opacity: 0.5,
          },
          silent: true,
          symbol: ["arrow", "arrow"],
          symbolSize: 20,

          // TODO: solve type error
          //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore -- Remove this line to see the error
          data: markLineData,
        },
      },
    ],
  };

  // TODO: The following part (let events...) of the code is duplicated in every chart component. Moving to separate file doesn't work, most likely because of chart.on -functions that might need to be defined in the same file as the chart is created.
  let events = {
    click: function () {
      if (componentIndex != undefined) {
        selectedIndices = updateSelectedIndices(componentIndex);
      }
    },
    mouseover: function () {
      highlightedIndex = componentIndex;
    },
    mouseout: function () {
      highlightedIndex = undefined;
    },
  };

  function updateSelectedIndices(indexToAdd: number) {
    let selectedCopy = selectedIndices.slice();
    // Check if selectedCopy already contains the index of the clicked solution
    if (selectedCopy.includes(indexToAdd)) {
      // If it does, remove it from the array (to unselect it)
      selectedCopy.splice(selectedCopy.indexOf(indexToAdd), 1);
    } else {
      // If it doesn't, add it to the array
      selectedCopy = [...selectedCopy, indexToAdd];
    }
    return selectedCopy;
  }
</script>

<EchartsComponent
  {option}
  bind:chart
  bind:events
  {colors}
  {disableAnimation}
  {aspect}
/>
<!-- height = {6/3} -->
