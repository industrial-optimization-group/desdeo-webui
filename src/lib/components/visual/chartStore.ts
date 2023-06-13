/** This file has all the svelte stores that are used in the visual component. */

import * as echarts from "echarts";
import type { EChartOption, ECharts } from "echarts";
import { writable } from "svelte/store";

export const chartStore = writable<ECharts[]>([]);
export const solutionsStore = writable<number[][]>([]);

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
  chartStore.update((charts) => [...charts, chart]);

  handleSelection(chart);

  return chart;
}

const selectedIndices: number[] = [];
/**
 * Adds an event listener to the chart to handle the selection of data points.
 *
 * @param chart The chart to add the event listener to
 */

//TODO: Is the return necessary?
function handleSelection(chart: ECharts): void {
  chart.on("click", (params) => {
    const dataIndex = params.dataIndex;
    const indexOfselected = selectedIndices.indexOf(dataIndex);

    // If the data point is already selected, remove it from the selectedIndices array and downplay it
    if (indexOfselected != -1) {
      selectedIndices.splice(indexOfselected, 1);
      // For each chart in the chartStore, dispatch an action to downplay the selected data point
      chartStore.update((charts) => {
        charts.forEach((c) => {
          // If chart has multiple series, downplay all series. This is the case for example for the petal chart.
          const hasMultipleSeries =
            c.getOption().series.length > 1
              ? [...Array(c.getOption().series.length).keys()]
              : false;
          if (hasMultipleSeries) {
            c.dispatchAction({
              type: "downplay",
              seriesIndex: hasMultipleSeries,
              dataIndex: dataIndex,
            });
          } else {
            c.dispatchAction({
              type: "downplay",
              seriesIndex: 0,
              dataIndex: dataIndex,
            });
          }
        });
        return charts;
      });
    }
    // If the data point is not selected, add it to the selectedIndices array and highlight it
    else {
      selectedIndices.push(dataIndex);
      // For each chart in the chartStore, dispatch an action to highlight the selected data point
      chartStore.update((charts) => {
        charts.forEach((c) => {
          // If chart has multiple series, highlight all series. This is the case for example for the petal chart.
          const hasMultipleSeries =
            c.getOption().series.length > 1
              ? [...Array(c.getOption().series.length).keys()]
              : false;
          if (hasMultipleSeries) {
            c.dispatchAction({
              type: "highlight",
              seriesIndex: hasMultipleSeries,
              dataIndex: dataIndex,
            });
          } else {
            c.dispatchAction({
              type: "highlight",
              seriesIndex: 0,
              dataIndex: dataIndex,
            });
          }
        });
        return charts;
      });
    }
  });
}
