<script lang="ts">
  //
  // TODO: Perhaps it would be more convenient to store the available problems,
  // the selected problem, and the selected method using stores and Svelte's
  // Context API?
  //

  import {
    login_status,
    LoginStatus,
    methodHeaderText,
    selectedProblem,
    type Problem,
  } from "$lib/api";

  export let problems: Problem[];

  import { goto } from "$app/navigation";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import GeneralError from "../util/undecorated/GeneralError.svelte";
  import SelectMethod from "./SelectMethod.svelte";
  import SelectProblem from "./SelectProblem.svelte";

  let tab = 0;
  let selected_problem: Problem;
  let selected_method = "";

  function goto_solve() {
    console.log("selected_problem", selected_problem);

    if (selected_method === "nimbus") {
      methodHeaderText.set("NIMBUS");
    } else if (selected_method === "nautilus") {
      methodHeaderText.set("NAUTILUS");
      selectedProblem.set(selected_problem);
    } else if (selected_method === "nautnavi") {
      methodHeaderText.set("NAUTILUS Navigator");
    } else if (selected_method === "reference_point_method") {
      methodHeaderText.set("Interactive RVEA");
      selectedProblem.set(selected_problem);
    } else {
      throw new Error("No method selected yet.");
    }
    console.log("selected_method", selected_method);

    goto("/solve");
  }
</script>
<TabGroup>
  <Tab bind:group={tab} name="select_problem" value={0}>1. Select a problem</Tab
  >
  {#if selected_problem}
    <Tab bind:group={tab} name="select_method" value={1}>2. Select a method</Tab
    >
  {/if}
  {#if selected_problem && selected_method}
    <Tab bind:group={tab} name="solve_problem" value={2} on:click={goto_solve}
      >3. Solve the problem</Tab
    >
  {/if}

  <svelte:fragment slot="panel">
    {#if tab === 0}
      <div class="mb-8">
        Please select a problem. Then continue to selecting a solution method.
      </div>
      <SelectProblem
        {problems}
        bind:selected_problem
        hide_saved={$login_status !== LoginStatus.LoggedInAsUser}
      />
    {:else if tab === 1 && selected_problem}
      <div class="mb-8">
        Please select a solution method. Then continue to solving the problem.
      </div>
      <SelectMethod problem={selected_problem} bind:selected_method />
    {:else}
      <GeneralError />
    {/if}
  </svelte:fragment>
</TabGroup>
