<script lang="ts">
  import type { Problem } from "$lib/api";
  import { getContext } from "svelte";
  let desdeo_problems: Problem[] = getContext("desdeo_problems");
  export let selected_problem: Problem | undefined = undefined;

  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import ProblemList from "./ProblemList.svelte";
  import ProblemDetails from "./ProblemDetails.svelte";
  import Card from "./Card.svelte";

  /*
   * The active tab. The default is to show the problems provided by DESDEO
   * because saving problems is not yet supported.
   */
  let tab = 1;
</script>

<TabGroup>
  <Tab bind:group={tab} name="saved" value={0}>Your saved problems</Tab>
  <Tab bind:group={tab} name="provided" value={1}
    >Problems provided by DESDEO</Tab
  >

  <svelte:fragment slot="panel">
    <div class="grid grid-cols-2 gap-10">
      <div>
        {#if tab === 0}
          Saving problems is not yet supported. Please take a look at the
          <button
            class="anchor"
            on:click={() => {
              tab = 1;
            }}>problems provided by DESDEO</button
          >.
        {:else if tab === 1}
          <Card>
            <ProblemList problems={desdeo_problems} bind:selected_problem />
          </Card>
        {/if}
      </div>
      <div>
        {#if selected_problem === undefined}
          <Card>
            <svelte:fragment slot="header">Instructions</svelte:fragment>
            <div>Select a problem to see more information.</div>
          </Card>
        {:else}
          <ProblemDetails problem={selected_problem} />
        {/if}
      </div>
    </div>
  </svelte:fragment>
</TabGroup>
