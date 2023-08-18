import type { EChartsType } from "echarts";

export function handleClickSelection(
  params: { dataIndex: number; componentType: string; seriesIndex: number },
  selectedIndices: number[],
  maxSelections: number | undefined
) {
  // Check if selectedIndices already contains the index of the clicked solution
  if (selectedIndices.includes(params.dataIndex)) {
    // If it does, remove it from the array (to unselect it)
    selectedIndices.splice(selectedIndices.indexOf(params.dataIndex), 1);
  } else {
    // If it doesn't, add it to the array
    selectedIndices = [...selectedIndices, params.dataIndex];
  }
  if (maxSelections !== undefined && selectedIndices.length > maxSelections) {
    selectedIndices.splice(selectedIndices.indexOf(params.dataIndex), 1);
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
  selectedIndices: number[],
  maxSelections: number | undefined
) {
  if (maxSelections !== undefined && selectedIndices.length <= maxSelections) {
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
    if (selectedIndices.length < maxSelections) {
      // Downplay all after selection, for selection to show
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
      });
    }
  }
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
  /* Explanation of the code line below:
                // Gets the model of parallelAxis component, which has all the axes as an array.
                const model = getChartModel(chart).getComponent("parallelAxis");
                // Gets the axesLayot which has the position info of every parallel axes
                const axes = model.coordinateSystem._axesLayout
                // Gets the x-coordinate of the i:th axis 
                const xCoord = Object.values(axes)[index].position[0] 
                */
  // TODO: How to get info needed without getModel. This is a private method and it can break in the future!!https://github.com/apache/echarts/issues/16479
  //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled

  return chart.getModel();
}

/**
 * A helper function that returns the y coordinate of the axis at the given
 * index.
 *
 * @param minimize - A boolean value that indicates if the indicator is for
 *   representing minimization.
 * @param index - The index of the axis.
 */
export function getAxisY(
  minimize: boolean,
  index: number,
  chart: echarts.EChartsType
): number {
  const parallelAxisComponent = getChartModel(
    chart as echarts.EChartsType
  ).getComponent("parallelAxis");
  if (minimize) {
    const axesLayout = parallelAxisComponent.coordinateSystem._axesLayout;
    const singleAxisObject = Object.values(axesLayout)[index] as {
      position: [number, number];
    };
    return singleAxisObject.position[1];
  } else {
    return parallelAxisComponent.coordinateSystem.getRect().y;
  }
}

/**
 * A helper function that returns the x-coordinate of the axis at the given
 * index.
 *
 * @param minimize - A boolean value that indicates if the indicator is for
 *   representing minimization.
 * @param index - The index of the axis.
 */
export function getAxisX(index: number, chart: echarts.EChartsType): number {
  const parallelAxisComponent = getChartModel(
    chart as echarts.EChartsType
  ).getComponent("parallelAxis");
  const axesLayout = parallelAxisComponent.coordinateSystem._axesLayout;
  const singleAxisObject = Object.values(axesLayout)[index] as {
    position: [number, number];
  };
  return singleAxisObject.position[0];
}
