<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import SelectProblem from "./SelectProblem.svelte";
  import SelectMethod from "./SelectMethod.svelte";
  import SolveProblem from "./SolveProblem.svelte";

  /** The active tab */
  let tab = 0;

  import type { Problem } from "$lib/api";
  let selected_problem: Problem;
</script>

<TabGroup>
  <Tab bind:group={tab} name="select_problem" value={0}>1. Select a problem</Tab
  >
  <!-- <Tab bind:group={tab} name="select_method" value={1}>2. Select a method</Tab> -->
  <Tab bind:group={tab} name="solve" value={2}>3. Solve the problem</Tab>

  <svelte:fragment slot="panel">
    {#if tab === 0}
      <div class="mb-8">
        Please select a problem. Then <button class="anchor"
          >continue to selecting a solution method</button
        >.
      </div>

      <SelectProblem bind:selected_problem />
    {:else if tab === 1}
      <div class="mb-8">
        Please select a solution method. Then <button class="anchor"
          >continue to solving the problem</button
        >.
      </div>

      <SelectMethod />
    {:else if tab === 2}
      <SolveProblem problem={selected_problem} />
    {/if}
  </svelte:fragment>
</TabGroup>
