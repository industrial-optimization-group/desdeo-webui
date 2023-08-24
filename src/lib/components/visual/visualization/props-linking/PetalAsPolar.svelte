<!--@component
    @description Makes a petal chart using the ECharts library's pie option.

    @prop {string} title - The title of the chart (solution name).
    @prop {string} color - The color of the chart (the color of the petals).
    @prop {number[]} values - The values of the petals (the values of the objectives).
    @prop {string[]} axisNames - The names of the axis (objectives).
    @prop {number[]} selectedIndices - The indices of the selected alternatives.
    @prop {number} highlightedIndex - The index of the highlighted altervative.
    @prop {number} maxSelections - The maximum number of selected solutions.
    @prop {number} componentIndex - The index of the component. Is needed when multiple charts are used, for the selection to know which of the charts refers to which alternative (solution).
-->
<!-- TODO: Clean code -->
<!-- TODO: Fix objective text that are now on top of each other (Implementing multiple charts in the same echarts instance could solve this issue)   -->

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
  export let maxSelections: number | undefined = undefined;
  export let componentIndex: number | undefined = undefined;

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
          // chart.dispatchAction({
          // type: "downplay",
          // seriesIndex: 0,
          // });
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
          // dataIndex: highlightedIndex,
        });
      }

      // chart.setOption({
      //   tooltip: {
      //     formatter: tooltipFormatter,
      //     borderColor: "",
      //     textStyle: {
      //       color: "",
      //     },
      //   },
      // });
    }
  }

  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices, maxSelections);
    }
  }

  // const names: string[] = name;
  // const values: number[][] = data.values;

  // let newSeriesObjects = [];
  // let subTexts: echarts.EChartTitleOption[] = [{ text: title }];
  // Change values of "values" to be positive with the map function.

  // let valuesPositive = objectiveValues.map((row) => row.map((value) => Math.abs(value)));
  // let valuesTransposed = valuesPositive;

  // Transpose values matrix. One liner from https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
  // let valuesTransposed = valuesPositive[0].map((col, i) =>
  //   valuesPositive.map((row) => row[i])
  // );
  // Set the column names
  // Create the series data for the radar chart.
  let seriesData: { value: number; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({
      value: values[i],
      name: axisNames[i],
    });
  }

  // let dataSet: (string | number)[][] = [["Objective", ...objectiveValues]];

  // let newRow: (string | number)[] = ["Solution " + (i + 1)];
  // newRow.push(...valuesTransposed[i]);
  // dataSet.push(newRow);

  // newSeriesObjects.push(

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
  //   // center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
  //   // To be under the petals when clicking.
  //   z: 1,
  //   silent: true,
  //   label: {
  //     show: false,
  //   },
  //   // data: [[1,2,3]],
  // }
  // );

  // Create the option object for the whole chart.

  const option: echarts.EChartOption = {
    title: {
      show: true,
      text: title,
      left: "center",
      // top:-10
    },

    tooltip: {},
    polar: {
      radius: ["12%", "80%"],
      center: ["50%", "55%"],
    },
    angleAxis: {
      type: "category",
      data: axisNames ? axisNames : [],
      startAngle: 90,
      axisLabel: {
        show: true,
        inside: true,
        // position: "middle",
        overflow: "truncate",
      },
    },
    radiusAxis: {
      // inverse: true,
      type: "value",
      // min: -3,
      scale: true, // Scaling needed for negative values, but on positive shows incorrectly
      // max: 4,
    },
    // dataset: {
    //   source: dataSet,
    // },
    series: [
      {
        type: "bar",
        coordinateSystem: "polar",
        selectedMode: "series",
        // label: {
        //   show: true,
        //   position: "inside",
        //   formatter: "{b}",
        // },
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

        // center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
        // encode: {
        //   itemName: "Solution",
        //   value: name,
        //   tooltip: name,
        // },
        // data: [
        data: seriesData,
      },
    ],
  };
  // let chart: echarts.EChartsType = createChart(id, option);

  // TODO: The following part of the code is duplicated in every chart component. Moving to separate file doesn't work, most likely because of chart.on -functions that might need to be defined in the same file as the chart is created.
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

<EchartsComponent {option} bind:chart bind:events {colors} />
