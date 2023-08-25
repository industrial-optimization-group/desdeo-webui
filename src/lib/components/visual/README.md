# Visual components

The visual folder contains mainly visualization components, which use Apache ECharts and Svelte libraries. ECharts handles the chart configuration and generation, Svelte is used to make them easily accessible as commponents.

## Folder structure:

### visual -folder

- Contains files that the different components use, such as constants.ts and helperFunctions.ts

#### general -folder

- Contains the EchartsComponent.svelte, which is used to create a chart and render it. This component is used in all visualization components.

#### preference-interaction -folder

- This folder contains components that are used in helping the user to select the preferred value.

#### visualization -folder

- This folder contains the visualization components. The components are divided into two subfolders.

- ##### props-linking -folder
  - Contains components that use props to link selections and highlighting with the rest of the cahrts.
  - These components don't use ECharts to link the charts, but instead use props for it.
- ##### multi-charts -folder
  - Contains components that uses ECharts to render multiple charts in one component.
  - This is achieved by using the series option in ECharts.
    - Each solution is a different series object in the series array.

## How to use the components

To add a component to your HTML, use it as a normal svelte component with props. So if you wish to add a parallel axis, first import it:

```typescript
import ParallelAxis from "$lib/components/visual/ParallelAxis.svelte";
```

Then add the HTML tag with the props:

```html
<ParallelAxis
  id="parallelAxis"
  title="Parallel Axis chart"
  data="{exampleData}"
/>
```

At the moment, the data should be given as `solutionData` type. All the DESDEO methods will give the data in this format, so it will be easy to use the data when using DESDEOs methods.

## How to make your own component

### Contributing

If you wish to contribute to the visual components, please read the general instructions from the master branch [README.md](https://github.com/industrial-optimization-group/desdeo-webui/tree/master#version-control-and-contributing)

### Step by step

1. Creating the chart
   - Configure ECharts options, for reference use echarts own documentation: [ECharts Docs](https://echarts.apache.org/en/option.html#title)
     ```typescript
     const option: echarts.EChartOption = {
       title: title,
       //Other options...
     };
     ```
   - Then use the createChart method to create the chart with these options
     ```typescript
     createChart(id, option);
     // You can also assign the created chart to a variable if you want to use it later.
     const chart: echarts.EChartsType = createChart(id, option);
     chart.setOption({
       //Some new options...
     });
     ```
1. Configuring the svelte component
   - Remember to add the component in your main page file:
     ```html
     <MyComponent id="myComponent" title="My chart" data="{exampleData}" />
     ```
1. Data processing

   - When getting the data from solutionData, it usually needs to be processed somehow to create the chart's series and names dynamically.
   - For example making the series dynamically.

     ```typescript
     let seriesData: { value: number[]; name: string }[] = [];
     for (let i = 0; i < values.length; i++) {
       seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
     }
     ```

     - This could be the used in the options as follows
       ```typescript
       const option: echarts.EChartOption = {
         title: title,
         //Other options...
         series: seriesdata,
       };
       ```
