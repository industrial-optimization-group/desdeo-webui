import * as echarts from "echarts";
import type { EChartOption, ECharts } from "echarts";
import { writable } from "svelte/store";

export const chartStore = writable<ECharts[]>([]);

export const solutionsStore = writable<number[][]>([]);

export function createChart(id: string, option: EChartOption) {
  const chart = echarts.init(document.getElementById(id) as HTMLCanvasElement);
  chart.setOption(option);
  chartStore.update((charts) => [...charts, chart]);

  addSelection(chart);

  return chart;
}

function addSelection(chart: ECharts) {
  chart.on("selectchanged", (params) => {
    const selectedDataIndex = params.fromActionPayload.dataIndexInside;
    const selectedNumbers =
      chart.getOption().series[0].data[selectedDataIndex].value;
    console.log(params);
    if (params.fromAction == "select") {
      solutionsStore.update((solutions) => {
        solutions.push(selectedNumbers);
        return solutions;
      });

      // solutions.push(selectedNumbers);

      chartStore.update((charts) => {
        charts.forEach((c) => {
          c.dispatchAction({
            type: "highlight",
            seriesIndex: 0,
            dataIndex: selectedDataIndex,
          });
        });
        return charts;
      });
      // chart.dispatchAction({
      //   type: "highlight",
      //   dataIndex: selectedDataIndex,
      // });
    } else {
      // Find the index in the solutions array of the solution that was deselected and remove it from the array.
      // let solutions = $solutionsStore;

      solutionsStore.update((solutions) => {
        const solutionIndex = solutions.findIndex(
          (element) => element.toString() == selectedNumbers.toString()
        );
        solutions.splice(solutionIndex, 1);
        return solutions;
      });

      chartStore.update((charts) => {
        charts.forEach((c) => {
          c.dispatchAction({
            type: "downplay",
            seriesIndex: 0,
            dataIndex: selectedDataIndex,
          });
        });
        return charts;
      });
    }
  });
}

// function addLinking()
