import * as echarts from "echarts";
import type { EChartOption, ECharts } from "echarts";
import { writable } from "svelte/store";

export const chartStore = writable<ECharts[]>([]);

export const solutionsStore = writable<number[][]>([]);

export function createChart(id: string, option: EChartOption) {
  const chart = echarts.init(document.getElementById(id) as HTMLCanvasElement);
  chart.setOption(option);
  chartStore.update((charts) => [...charts, chart]);

  handleSelection(chart);

  return chart;
}

const selectedIndices: number[] = [];
function handleSelection(chart: ECharts): void {
  chart.on("click", (params) => {
    const dataIndex = params.dataIndex;
    const indexOfselected = selectedIndices.indexOf(dataIndex);
    if (indexOfselected != -1) {
      selectedIndices.splice(indexOfselected, 1);
      chartStore.update((charts) => {
        charts.forEach((c) => {
          c.dispatchAction({
            type: "downplay",
            seriesIndex: 0,
            dataIndex: dataIndex,
          });
        });
        return charts;
      });
    } else {
      selectedIndices.push(dataIndex);
      chartStore.update((charts) => {
        charts.forEach((c) => {
          c.dispatchAction({
            type: "highlight",
            seriesIndex: 0,
            dataIndex: dataIndex,
          });
        });
        return charts;
      });
    }
  });
}
