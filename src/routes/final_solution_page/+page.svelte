<script lang="ts">
  import ProblemDetails from "$lib/components/main/ProblemDetails.svelte";
  import Visualizations from "$lib/components/util/undecorated/Visualizations.svelte";
  import Table from "$lib/components/util/undecorated/Table.svelte";
  import { type Problem, type Point, selectedProblem } from "$lib/api";

  // Final chosen solution for demonstration with three objectives
  let finalChosenSolution: Point = [120, 85, 15]; // Low cost, good quality, low environmental impact

  // Setting specific ideal and nadir points for visualization ranges
  let ideal_point: Point = [100, 95, 10]; // Ideal points
  let nadir_point: Point = [500, 50, 100]; // Nadir points

  let problem: Problem = $selectedProblem;
  let finalSolution: Point[] = [finalChosenSolution]; // Replace this to instead fetch the correct solution from backend
  let objectiveNames = problem.objectives.map(obj => obj.name);

  let method = {
    problem,
    objective_names_with_goals: (problem: { objectives: any[]; }) => problem.objectives.map(o => `${o.name} (${o.minimize ? 'Minimize' : 'Maximize'})`),
    lower_bounds: ideal_point, // Using ideal points as lower bounds for testing
    upper_bounds: nadir_point, // Using nadir points as upper bounds for testing
  };

  let selected_solutions: undefined = undefined;
  let visualizations_tab = 0;
  let gridded_visualizations = false;
  let decimals = 2;
</script>

<div class="container">
  <div>
    <ProblemDetails {problem} />
  </div>
  <div class="visualization-section">
    <strong style="padding-top: 15px;">Visualization</strong>
    <Visualizations
      names={method.objective_names_with_goals(problem)}
      values={finalSolution}
      lower_bounds={method.lower_bounds}
      upper_bounds={method.upper_bounds}
      lower_is_better={problem.objectives.map(({ minimize }) => minimize)}
      grid_mode={gridded_visualizations}
      bind:selected={selected_solutions}
      bind:tab={visualizations_tab}
    />
    <strong>Solution table</strong>
    <div class="flex flex-col gap-4">
      <div class="overflow-x-auto">
        <Table
          head={method.objective_names_with_goals(problem)}
          body={finalSolution.map((solution) => solution.map((value) => value.toFixed(decimals)))}
          bind:selected_rows={selected_solutions}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 2fr; /* Adjusts the width ratio between the two main areas */
    gap: 20px; /* Space between columns */
    padding: 20px; /* Padding around the grid */
  }

  .visualization-section {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Space between elements inside the visualization section */
  }
</style>
