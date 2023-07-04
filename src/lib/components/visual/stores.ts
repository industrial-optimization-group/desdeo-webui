/** This file has all the svelte stores that are used in the visual component. */

import * as echarts from "echarts";
import type { EChartOption, ECharts } from "echarts";
import { writable } from "svelte/store";

export const chartStore = writable<ECharts[]>([]);
export const selectedSolutions = writable([]);
export const selectedSolutionsIndices = writable([]);

export const colorPalette = [
  "#a6b1e1",
  "#eab0d9",
  "#cbe2b0",
  "#ffeb99",
  "#f8a978",
  "#f6dfeb",
  "#94daff",
  "#f6d7a7",
  "#caf7e3",
  "#ffb6b9",
];

/**
 * Creates a chart and adds it to the chartStore.
 *
 * @param {string} id Id of the canvas element
 * @param {EChartOption} option Chart configuration as EChartOption
 * @returns The chart object
 */
export function createChart(id: string, option: EChartOption) {
  const chart = echarts.init(document.getElementById(id) as HTMLCanvasElement);
  chart.setOption(option);
  chart.setOption({
    color: colorPalette,
    emphasis: {
      lineStyle: {
        opacity: 1,
        color: "#441151",
      },
      itemStyle: {
        // opacity: 0,
        color: "#441151",
      },
    },
  });
  chartStore.update((charts) => [...charts, chart]);

  handleSelection(chart);

  return chart;
}

export function updateChart(id: string, option: EChartOption) {
  let oldCharts: ECharts[] = [];
  chartStore.subscribe((charts) => {
    oldCharts = charts;
  });

  const chart = oldCharts.find((chart) => chart.getDom().id == id);

  if (chart == undefined) return;

  chart.setOption(option, true, false);
}

const selectedIndices: number[] = [];
const selectedSolutionsArray = [];
/**
 * Adds an event listener to the chart to handle the selection of data points.
 *
 * @param chart The chart to add the event listener to
 */

function handleSelection(chart: ECharts): void {
  let hasMultipleSeries;

  function addEffectToCharts(
    effect: string,
    charts: ECharts[],
    dataIndex: number
  ) {
    charts.forEach((c) => {
      // If chart has multiple series, downplay all series. This is the case for example for the petal chart.
      hasMultipleSeries =
        c.getOption().series.length > 1
          ? [...Array(c.getOption().series.length).keys()]
          : false;
      if (hasMultipleSeries) {
        c.dispatchAction({
          type: effect,
          seriesIndex: hasMultipleSeries,
          dataIndex: dataIndex,
        });
      } else {
        c.dispatchAction({
          type: effect,
          seriesIndex: 0,
          dataIndex: dataIndex,
        });
      }
    });
    return charts;
  }

  // chart.on("select", (params) => {
  //   console.log("tets");
  // });
  // chart.on("brushSelected", (params) => {
  //   console.log("brushSeelcted");
  //   // chartStore.update((charts) => {
  //   //   return addEffectToCharts("highlight", charts, 0);
  //   // });
  // });
  // chart.on("brushEnd", (params) => {
  //   console.log("brushEnd");
  // });

  // Highlight the data point when the mouse hovers over it
  chart.on("mouseover", (params) => {
    const dataIndex = params.dataIndex;

    if (dataIndex == undefined) return;

    // Highlight the data point in every chart in chartStore
    chartStore.update((charts) => {
      return addEffectToCharts("highlight", charts, dataIndex);
    });
  });

  // Downplay the data point when the mouse leaves it
  chart.on("mouseout", (params) => {
    const dataIndex = params.dataIndex;
    // Downplay the data point only if it is not selected
    if (selectedIndices.indexOf(dataIndex) == -1) {
      // Downplay the data point in every chart in chartStore
      chartStore.update((charts) => {
        return addEffectToCharts("downplay", charts, dataIndex);
      });
    }
  });

  // Select the data point when it is clicked

  chart.on("click", (params) => {
    const dataIndex = params.dataIndex;
    if (dataIndex === undefined) return;
    const indexOfselected = selectedIndices.indexOf(dataIndex);

    // If the data point is already selected, remove it from the selectedIndices array and downplay it
    if (indexOfselected != -1) {
      selectedIndices.splice(indexOfselected, 1);
      selectedSolutionsArray.splice(indexOfselected, 1);
      // For each chart in the chartStore, dispatch an action to downplay the selected data point
      chartStore.update((charts) => {
        return addEffectToCharts("downplay", charts, dataIndex);
      });
    }
    // If the data point is not selected, add it to the selectedIndices array and highlight it
    else {
      selectedIndices.push(dataIndex);
      //TODO: When selecting from pie, should also show all objective values, not only the pie charts own
      console.log(chart.getOption().series);
      const selectedObject = Array.isArray(params.data)
        ? {
            name: params.data[0],
            value: [...params.data.slice(1)],
          }
        : params.data;
      selectedSolutionsArray.push(selectedObject);
      // For each chart in the chartStore, dispatch an action to highlight the selected data point
      chartStore.update((charts) => {
        return addEffectToCharts("highlight", charts, dataIndex);
      });
    }

    selectedSolutions.update((solutions) => {
      solutions = selectedSolutionsArray;
      // console.log(solutions);
      return solutions;
    });

    selectedSolutionsIndices.update((solutions) => {
      solutions = selectedIndices;
      // console.log(solutions);
      return solutions;
    });
  });
}
