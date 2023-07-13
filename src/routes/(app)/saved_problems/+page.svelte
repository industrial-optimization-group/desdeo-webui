<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import SavedProblems from "$lib/components/main/SavedProblems.svelte";
  import ProblemDetails from "$lib/components/main/ProblemDetails.svelte";
  import Card from "$lib/components/main/Card.svelte";
  import {} from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { get_saved_problems, type SavedProblem } from "$lib/api";

  let tabSet = 0;
  let problems: SavedProblem[] = [];
  let selectedProblem: SavedProblem | undefined = undefined;

  onMount(() => {
    get_saved_problems().then((savedProblems) => {
      problems = savedProblems;
    });
  });

  // Fake data to experiment with
  // const fake_problems = [
  //   {
  //     id: 1,
  //     name: "Problem 1",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 2,
  //     name: "Problem 2",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 3,
  //     name: "Problem 3",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 4,
  //     name: "Problem 4",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 5,
  //     name: "Problem 5",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 6,
  //     name: "Problem 6",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 7,
  //     name: "Problem 7",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 8,
  //     name: "Problem 8",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 9,
  //     name: "Problem 9",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 10,
  //     name: "Problem 10",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 11,
  //     name: "Problem 11",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 12,
  //     name: "Problem 12",
  //     problem_type: "Continuous",
  //   },
  //   {
  //     id: 13,
  //     name: "Problem 13",
  //     problem_type: "Continuous",
  //   },
  // ];
</script>

<TabGroup>
  <Tab bind:group={tabSet} name="tab1" value={0}>Your saved problems</Tab>
  <Tab bind:group={tabSet} name="tab2" value={1}
    >Problems provided by DESDEO</Tab
  >
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    <div class="grid grid-cols-2 gap-20">
      <div>
        {#if tabSet === 0}
          TODO
        {:else if tabSet === 1}
          <SavedProblems {problems} bind:selectedProblem />
        {/if}
      </div>
      <div>
        {#if selectedProblem === undefined}
          <Card>
            <svelte:fragment slot="header">Instructions</svelte:fragment>
            <div>Select a problem to see problem details.</div>
          </Card>
        {:else}
          <ProblemDetails problem={selectedProblem} />
        {/if}
      </div>
    </div>
  </svelte:fragment>
</TabGroup>
