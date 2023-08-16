import type { EChartsType } from "echarts";

export function handleClickSelection(
  params: { dataIndex: number; componentType: string; seriesIndex: number },
  selectedIndices: number[]
) {
  // Check if selectedIndices already contains the index of the clicked solution
  if (selectedIndices.includes(params.dataIndex)) {
    // If it does, remove it from the array (to unselect it)
    selectedIndices.splice(selectedIndices.indexOf(params.dataIndex), 1);
  } else {
    // If it doesn't, add it to the array
    selectedIndices = [...selectedIndices, params.dataIndex];
  }

  if (params.componentType === "series") {
    // console.log(params.seriesIndex);
    // console.log(params.dataIndex);
    // selectedIndices = [params.dataIndex];
  }
  return selectedIndices;
}

export function handleHighlightChange(
  chart: EChartsType,
  highlightedIndex: number | undefined
) {
  if (highlightedIndex === undefined) {
    // highlightedIndex = -1;
    chart.dispatchAction({
      type: "downplay",
      seriesIndex: 0,
    });
  } else {
    chart.dispatchAction({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: highlightedIndex,
    });
  }

  return chart;
}

export function handleSelectionChange(
  chart: EChartsType,
  selectedIndices: number[]
) {
  chart.dispatchAction({
    type: "unselect",
    seriesIndex: 0,
    dataIndex: getChartModel(chart).getSeries()[0].getSelectedDataIndices(),
  });
  chart.dispatchAction({
    type: "select",
    seriesIndex: 0,
    dataIndex: selectedIndices,
  });
  // Downplay all after selection, for selection to show
  chart.dispatchAction({
    type: "downplay",
    seriesIndex: 0,
  });
  return chart;
}

/**
 * Returns the model of a chart. This function exists so that ts-ignore doesn't
 * have to be mentioned in every file where getModel() is used.
 *
 * @param chart Chart instance to get the model from
 * @returns
 */
export function getChartModel(chart: EChartsType) {
  // TODO: How to get info needed without getModel. This is a private method and it can break in the future!!https://github.com/apache/echarts/issues/16479
  //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
  return chart.getModel();
}
