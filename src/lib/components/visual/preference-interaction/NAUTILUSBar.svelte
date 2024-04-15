<script lang="ts" context="module">
  import { colorPalette } from "$lib/components/visual/constants";
  import * as echarts from "echarts";
  // import type { SolutionData } from "$lib/components/visual/types";

  export type chartInput = {
    ideal: number;
    nadir: number;
    reachableRanges: [number, number];
    objIndex: number;
  };

  export function NAUTILUSBarChart(
    element: HTMLElement,
    chartInput: chartInput
  ) {
    let { ideal, nadir, reachableRanges, objIndex } = chartInput;

    let barColor = colorPalette[objIndex];

    const chart = echarts.init(element, "", { renderer: "svg" });

    try {
      const options = CreateOptions(ideal, nadir, reachableRanges, barColor);
      chart.setOption(options);
    } catch (e) {
      console.error(e);
      return;
    }

    // Resize handler
    function resize() {
      chart.resize();
    }
    // add resize event listener
    window.addEventListener("resize", resize);

    return {
      destroy() {
        // remove resize event listener
        window.removeEventListener("resize", resize);
        // dispose the chart instance
        chart.dispose();
      },
      update(chartInput: chartInput) {
        ideal = chartInput.ideal;
        nadir = chartInput.nadir;
        reachableRanges = chartInput.reachableRanges;
        barColor = colorPalette[chartInput.objIndex];
        const options = CreateOptions(ideal, nadir, reachableRanges, barColor);
        chart.setOption(options);
      },
    };
  }

  function CreateOptions(
    ideal: number,
    nadir: number,
    reachableRanges: [number, number],
    barColor: string
  ) {
    const min = ideal < nadir ? ideal : nadir;
    const max = ideal > nadir ? ideal : nadir;

    const data = [
      [reachableRanges[0], 0],
      [reachableRanges[1], 0],
      [reachableRanges[1], 1],
      [reachableRanges[0], 1],
    ];
    // Create the base option object of the horizontal bar.
    let options: echarts.EChartOption = {
      tooltip: {
        // show:false,
        trigger: "none",
        triggerOn: "none",
        position: [20, -30],
      },
      xAxis: {
        type: "value",
        min: min,
        max: max,
        show: false,
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 1,
        show: false,
      },
      series: [
        {
          type: "custom",
          data: [1, 2, 3, 4],
          renderItem: function (params, api) {
            let points: number[][] = [];
            for (let i = 0; i < data.length; i++) {
              points.push(api.coord?.(data[i]));
            }
            return {
              type: "polygon",
              transition: ["shape"],
              shape: {
                points: points,
              },
              style: api.style?.({
                fill: barColor,
                stroke: echarts.color.lift(barColor, 0.1),
              }),
            };
          },
        },
      ],
    };

    return options;
  }
</script>
