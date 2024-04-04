<script lang="ts" context="module">
  import * as echarts from "echarts";

  export type ChartInput = {
    lowerBounds: number[]; // The lower bounds to use for the chart.
    upperBounds: number[]; // The upper bounds to use for the chart.
    idealValue: number; // The ideal value for the objective.
    nadirValue: number; // The nadir value for the objective.
    isMaximized: boolean; // Is the objective maximized
    pastPreferences: number[]; // The past preferences for the objective.
    pastBound: number[]; // The past bounds for the objective.
    currentPreference: number; // The current preference for the objective.
    currentBound: number; // The current bound for the objective.
    totalSteps: number; // The total number of steps for the method.
    currentStep: number; // The current step for the method.
    maxStepReached: number; // The maximum step reached for the method.
    color: string; // The color to use for the chart.
    pastPreferencesColor: string; // The color of the past preferences
    pastBoundsColor: string; // The color of the past bounds
  };
  type CSD = {
    value: [number, number];
    symbolSize?: number;
    symbol?: string;
  };

  function CheckLengths(
    lowerBounds: number[],
    upperBounds: number[],
    pastPreferences: number[],
    pastBounds: number[]
  ) {
    if (lowerBounds.length !== upperBounds.length) {
      throw new Error(
        "The lower bounds and upper bounds must have the same length."
      );
    }

    if (pastPreferences.length !== pastBounds.length) {
      throw new Error(
        "The past preferences and past bounds must have the same length."
      );
    }

    if (pastPreferences.length !== lowerBounds.length) {
      throw new Error(
        "The past preferences, past bounds, lower bounds and upper bounds must have the same length."
      );
    }
  }

  function CreateOptions(
    chartInput: ChartInput,
    symbolSize: number
  ):
    | { OPTIONS: echarts.EChartOption; CSD: CSD[]; YMIN: number; YMAX: number }
    | undefined {
    let {
      lowerBounds,
      upperBounds,
      idealValue,
      nadirValue,
      isMaximized,
      pastPreferences,
      pastBound: pastBounds,
      currentPreference,
      currentBound,
      totalSteps,
      currentStep,
      maxStepReached,
      color,
      pastPreferencesColor,
      pastBoundsColor,
    } = chartInput;
    console.log("currentStep in create", currentStep);

    try {
      CheckLengths(lowerBounds, upperBounds, pastPreferences, pastBounds);
    } catch (e) {
      console.error(e);
      return;
    }

    // repeat the first value to make the chart look better
    let extlowerBounds = [lowerBounds[0], ...lowerBounds];
    let extupperBounds = [upperBounds[0], ...upperBounds];
    let extpastPreferences = [pastPreferences[0], ...pastPreferences];
    let extpastBounds = [pastBounds[0], ...pastBounds];

    // Convert to index-value pairs
    // Starts at -1 so that there is some thickness to the range at the start
    // To make it thicker, start at a larger negative number -> Make sure to adjust the repeat value above
    let extlowerBoundsIndex: [number, number][] = extlowerBounds.map(
      (value, index) => [index - 1, value]
    );
    let extupperBoundsIndex: [number, number][] = extupperBounds.map(
      (value, index) => [index - 1, value]
    );

    // Round trip of the index-value pairs to make the hull of the reachable range
    let extBoundsIndex = [
      ...extupperBoundsIndex,
      ...extlowerBoundsIndex.reverse(),
    ];

    // Calculate the y-axis limits
    let ymin = isMaximized ? nadirValue : idealValue;
    let ymax = isMaximized ? idealValue : nadirValue;

    // Draw a vertical line at the current step.
    let currentStepData: CSD[] = [
      { value: [currentStep, ymin], symbol: "none" },
      { value: [currentStep, (ymin + ymax) / 2], symbolSize: symbolSize },
      { value: [currentStep, ymax], symbol: "none" },
    ];
    return {
      OPTIONS: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          formatter: function (params, ticket, callback) {
            if (!Array.isArray(params)) {
              return "";
            }
            if (params.length < 2) {
              return "";
            }
            if (
              !(typeof params[0].value === "number") ||
              !(typeof params[1].value === "number")
            ) {
              return "";
            }
            let lowerbound = params[0].value;
            let upperBound = params[1].value + lowerbound;
            let pastPreference = params[2].value;
            let pastBound = params[3].value;
            return `
          <b>Step ${params[0].axisValue}</b><br>
          Lower bound: ${lowerbound}<br>
          Upper bound: ${upperBound}<br>
          Past preference: ${pastPreference}<br>
          Past bound: ${pastBound}<br>
        `;
          },
          confine: true,
        },
        grid: {
          id: "rangeGrid",
          left: 0,
          top: 5,
          bottom: 5,
          right: "10%",
          containLabel: false,
        },
        xAxis: {
          type: "value",
          min: -1,
          max: totalSteps,
          show: false,
        },
        yAxis: {
          type: "value",
          min: ymin,
          max: ymax,
          position: "right",
          splitNumber: 4,
          axisLabel: {
            showMaxLabel: true,
            showMinLabel: true,
          },
        },
        series: [
          // Draw the reachable range as a custom graphic elemend
          {
            type: "custom",
            renderItem: function (params, api) {
              let points: number[][] = [];
              for (let i = 0; i < extBoundsIndex.length; i++) {
                points.push(api.coord?.(extBoundsIndex[i]));
              }
              return {
                type: "polygon",
                transition: ["shape"],
                shape: {
                  points: points,
                },
                style: api.style?.({
                  fill: color,
                  stroke: echarts.color.lift(color, 0.1),
                }),
              };
            },
            data: extBoundsIndex,
          },
          // Draw the past preferences.
          {
            name: "Aspiration level",
            type: "line",
            symbol: "none",
            lineStyle: { color: pastPreferencesColor, type: "solid" },
            emphasis: {},
            data: extpastPreferences.map((value, index) => [index - 1, value]),
          },
          // Draw the past bounds.
          {
            name: "Bound value",
            type: "line",
            symbol: "none",
            lineStyle: { color: pastBoundsColor, type: "dashed" },
            emphasis: {},
            data: extpastBounds.map((value, index) => [index - 1, value]),
          },
          // Draw a vertical line at the current step.
          {
            name: "Current step",
            id: "currentStep",
            type: "line",
            lineStyle: { color: "black" },
            emphasis: {},
            // Note that we need to add 1 to the current step, because the x-axis starts at -1...
            // which is treated as 0 for some reason. Makes interaction more difficult.
            data: currentStepData,
          },
          // Draw a vertical dashed line at the max step reached
          {
            name: "Max step reached",
            type: "line",
            lineStyle: { color: "black", type: "dashed" },
            emphasis: {},
            data: [
              [maxStepReached, ymin],
              [maxStepReached, ymax],
            ],
          },
          // Draw horizontal lines for the current preference and bound
          {
            name: "Current preference",
            type: "line",
            lineStyle: { color: pastPreferencesColor },
            emphasis: {},
            data: [
              [currentStep, currentPreference],
              [totalSteps, currentPreference],
            ],
          },
          {
            name: "Current bound",
            type: "line",
            lineStyle: { color: pastBoundsColor, type: "dashed" },
            emphasis: {},
            data: [
              [currentStep, currentBound],
              [totalSteps, currentBound],
            ],
          },
        ],
        animation: false,
      },
      CSD: currentStepData,
      YMIN: ymin,
      YMAX: ymax,
    };
  }

  function InteractiveCSDOptions(
    currentStepData: CSD[],
    symbolSize: number,
    chart: echarts.EChartsType,
    currentStep: number,
    maxStepReached: number,
    ymin: number,
    ymax: number,
    CSHandler: (newCurrentStep: number) => void
  ): echarts.EChartOption {
    return {
      graphic: currentStepData.map((item, index) => {
        if (index === 1) {
          return {
            type: "circle",
            id: "currentStepDragger",
            position: chart.convertToPixel({ gridId: "rangeGrid" }, item.value),
            shape: {
              cx: 0,
              cy: 0,
              r: symbolSize,
            },
            style: {
              linewidth: 10,
              stroke: "black",
              fill: "#00000000",
            },
            draggable: "horizontal",
            animation: false,
            z: 10,

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ondrag: function (dx: number, dy: number) {
              const yminPix = chart.convertToPixel({ gridId: "rangeGrid" }, [
                0,
                ymin,
              ])[1];
              let newCSD = currentStepData;

              let newX = chart.convertFromPixel({ gridId: "rangeGrid" }, [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this as any).x,
                yminPix,
              ])[0];

              if (newX < 0) {
                newX = 0;
              } else if (newX > maxStepReached) {
                newX = maxStepReached;
              }

              newX = Math.round(newX);
              newCSD[0].value[0] =
                newCSD[1].value[0] =
                newCSD[2].value[0] =
                  newX;
              chart.setOption({
                series: [
                  {
                    id: "currentStep",
                    data: newCSD,
                  },
                ],
              });
            },
            // Mouseout won't work as "mouse out" is out of circle, not the whole chart.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ondragend: function (dx: number, dy: number) {
              const yminPix = chart.convertToPixel({ gridId: "rangeGrid" }, [
                0,
                ymin,
              ])[1];

              let newX = chart.convertFromPixel({ gridId: "rangeGrid" }, [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this as any).x,
                yminPix,
              ])[0];
              if (newX < 0) {
                newX = 0;
              } else if (newX > maxStepReached) {
                newX = maxStepReached;
              }
              newX = Math.round(newX);
              let newPos = chart.convertToPixel({ gridId: "rangeGrid" }, [
                newX,
                (ymin + ymax) / 2,
              ]);
              chart.setOption({
                graphic: [
                  {
                    id: "currentStepDragger",
                    position: newPos,
                  },
                ],
              });
              CSHandler(newX);
            },
          };
        }
      }),
    };
  }

  export function RangeChart(
    element: HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [chartInput, CSHandler, rerender, enableInteraction]: [
      ChartInput,
      (newCurrentStep: number) => void,
      boolean,
      boolean
    ]
  ) {
    // Set the symbol size for the current step draggable circle
    const symbolSize = 10;
    // Create the chart instance at the given div element
    const chart = echarts.init(element, "", { renderer: "svg" });
    // Set the chart options or log an error if the options if something goes wrong
    let options: echarts.EChartOption,
      ymin: number,
      ymax: number,
      currentStepData: CSD[];
    try {
      const OptionsOutput = CreateOptions(chartInput, symbolSize);
      if (OptionsOutput === undefined) {
        throw new Error("Options are undefined");
      }
      options = OptionsOutput.OPTIONS;
      currentStepData = OptionsOutput.CSD;
      ymin = OptionsOutput.YMIN;
      ymax = OptionsOutput.YMAX;
      chart.setOption(options);
    } catch (e) {
      console.error(e);
      return;
    }

    // Resize handler
    function resize() {
      chart.resize();
    }

    // Graphic element for the current step
    // This is a draggable circle that can be used to change the current step
    // It is added after the chart is initialized, because it needs to be added to the chart instance
    // and the chart instance is only available after the chart is initialized
    // setTimeout puts the execution of the code at the end of the event loop

    if (enableInteraction) {
      setTimeout(() => {
        chart.setOption(
          InteractiveCSDOptions(
            currentStepData,
            symbolSize,
            chart,
            chartInput.currentStep,
            chartInput.maxStepReached,
            ymin,
            ymax,
            CSHandler
          )
        );
      }, 0);
    }

    // add resize event listener
    window.addEventListener("resize", resize);

    // Return

    return {
      destroy() {
        // remove resize event listener
        window.removeEventListener("resize", resize);
        // dispose the chart instance
        chart.dispose();
      },
      update([newchartInput, newCSHandler, rerender, enableInteraction]: [
        ChartInput,
        (newCurrentStep: number) => void,
        boolean,
        boolean
      ]) {
        if (!rerender) {
          return;
        }
        let newOptions = CreateOptions(newchartInput, symbolSize);
        if (newOptions === undefined) {
          throw new Error("Options are undefined");
        } else {
          chart.setOption({ ...newOptions.OPTIONS });
          if (enableInteraction) {
            chart.setOption({
              ...InteractiveCSDOptions(
                newOptions.CSD,
                symbolSize,
                chart,
                newchartInput.currentStep,
                newchartInput.maxStepReached,
                newOptions.YMIN,
                newOptions.YMAX,
                newCSHandler
              ),
            });
          } else {
            chart.setOption({
              graphic: [],
            });
          }
        }
      },
    };
  }
</script>
