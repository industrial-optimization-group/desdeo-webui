<!--@component
    @description Makes multiple petal charts in one component. 
-->
<!-- TODO: Highlighting and selection don't work properly. Most propably bug in the using of seriesIndex and dataIndex -->

<script lang="ts">
  // import { onDestroy } from "svelte";
  // import { chartStore } from "$lib/components/visual/chartStore";
  import type * as echarts from "echarts";
  import {
    handleClickSelection,
    handleHighlightChange,
    handleSelectionChange,
  } from "$lib/components/visual/helperFunctions";
  import EchartsComponent from "../../../general/EchartsComponent.svelte";

  // export let id: string;
  // export let title = "Test title";
  // export let data: SolutionData;

  export let values: number[][];
  // export let minimize: boolean[];
  // export let showIndicators = false;
  export let indicatorNames: string[] = [];
  export let selectedIndices: number[] = [];
  export let title = "Test title";
  export let highlightedIndices: number | undefined = undefined;
  export let maxSelections: number | undefined = undefined;
  // export let data: SolutionData;
  $: {
    if (chart) {
      handleHighlightChange(chart, highlightedIndices);
    }
  }

  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices, maxSelections);
    }
  }

  const names: string[] = indicatorNames;
  // const values: number[][] = data.values;

  let newSeriesObjects = [];
  let subTexts: echarts.EChartTitleOption[] = [{ text: title }];
  // Change values of "values" to be positive with the map function.
  let valuesPositive = values.map((row) => row.map((value) => Math.abs(value)));
  let valuesTransposed = valuesPositive;
  // Transpose values matrix. One liner from https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
  // let valuesTransposed = valuesPositive[0].map((col, i) =>
  //   valuesPositive.map((row) => row[i])
  // );
  // Set the column names
  let dataSet: (string | number)[][] = [["Solution", ...names]];
  for (let i = 0; i < valuesTransposed.length; i++) {
    let newRow: (string | number)[] = ["Objective " + (i + 1)];
    newRow.push(...valuesTransposed[i]);
    dataSet.push(newRow);

    newSeriesObjects.push(
      {
        name: names[i],
        type: "pie",
        radius: "30%",
        roseType: "area",
        center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
        encode: {
          itemName: "Solution",
          value: names[i],
          tooltip: names[i],
        },
      }
      // A circle for showing the lines between petals and border line.
      // {
      //   type: "pie",
      //   radius: "30%",
      //   tooltip: {
      //     show: false,
      //   },
      //   roseType: "area",
      //   itemStyle: {
      //     borderWidth: 1,
      //     borderColor: "gray",
      //     color: "transparent",
      //   },
      //   emphasis: {
      //     itemStyle: {
      //       borderWidth: 1,
      //       borderColor: "gray",
      //       color: "transparent",
      //     },
      //   },
      //   center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
      //   // To be under the petals when clicking.
      //   z: 1,
      //   silent: true,
      //   label: {
      //     show: false,
      //   },
      //   data: [...Array(valuesTransposed.length).fill(1)],
      // }
    );

    subTexts.push({
      subtext: names[i],
      left: ((i + 0.5) / valuesTransposed.length) * 100 + "%",
      top: "20%",
      textAlign: "center",
    });
  }

  // Create the option object for the whole chart.
  const option: echarts.EChartOption = {
    title: subTexts,
    // tooltip: {
    //   formatter: (params) => {
    //     return (
    //       params.name +
    //       "</br>" +
    //       "</br>" +
    //       params.seriesName +
    //       " value" +
    //       ": " +
    //       params.data[params.seriesIndex + 1] +
    //       "</br>" +
    //       "All values" +
    //       ": " +
    //       valuesPositive[params.dataIndex]
    //     );
    //   },
    // },
    dataset: {
      source: dataSet,
    },
    series: newSeriesObjects,
  };
  // let chart: echarts.EChartsType = createChart(id, option);

  // TODO: The following part of the code is duplicated in every chart component. Moving to separate file doesn't work, most likely because of chart.on -functions that might need to be defined in the same file as the chart is created.
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
      highlightedIndices = params.dataIndex;
    },
    mouseout: function () {
      highlightedIndices = undefined;
    },
  };
</script>

<EchartsComponent {option} bind:chart bind:events colors={[]} />
