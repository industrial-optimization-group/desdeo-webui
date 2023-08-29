<script lang="ts">
  //
  // TODO: Perhaps it would be more convenient to store the available problems,
  // the selected problem, and the selected method using stores and Svelte's
  // Context API?
  //

  import { login_status, LoginStatus } from "$lib/api";
  import type { Problem } from "$lib/api";

  export let problems: Problem[];

  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import SelectProblem from "./SelectProblem.svelte";
  import SelectMethod from "./SelectMethod.svelte";
  import SolveProblem from "./SolveProblem.svelte";
  import GeneralError from "../util/undecorated/GeneralError.svelte";

  let tab = 0;
  let selected_problem: Problem | undefined = undefined;
  let selected_method = "";
</script>

<TabGroup>
  <Tab bind:group={tab} name="select_problem" value={0}>1. Select a problem</Tab
  >
  {#if selected_problem}
    <Tab bind:group={tab} name="select_method" value={1}>2. Select a method</Tab
    >
  {/if}
  {#if selected_problem && selected_method}
    <Tab bind:group={tab} name="solve_problem" value={2}
      >3. Solve the problem</Tab
    >
  {/if}

  <svelte:fragment slot="panel">
    {#if tab === 0}
      <div class="mb-8">
        Please select a problem. Then <button
          class="anchor"
          on:click={() => {
            tab = 1;
          }}
          disabled={!selected_problem}
          >continue to selecting a solution method</button
        >.
      </div>
      <SelectProblem
        {problems}
        bind:selected_problem
        hide_saved={$login_status !== LoginStatus.LoggedInAsUser}
      />
    {:else if tab === 1 && selected_problem}
      <div class="mb-8">
        Please select a solution method. Then <button
          class="anchor"
          on:click={() => {
            tab = 2;
          }}
          disabled={!selected_problem || !selected_method}
          >continue to solving the problem</button
        >.
      </div>
      <SelectMethod problem={selected_problem} bind:selected_method />
    {:else if tab === 2 && selected_problem && selected_method}
      <SolveProblem problem={selected_problem} method={selected_method} />
    {:else}
      <GeneralError />
    {/if}
  </svelte:fragment>
</TabGroup>
