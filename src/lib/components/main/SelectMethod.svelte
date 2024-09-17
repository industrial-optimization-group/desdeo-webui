<script lang="ts">
  import ProblemDetails from "./ProblemDetails.svelte";
  import Card from "./Card.svelte";
  import type { Problem } from "$lib/api";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";

  let single_methods = [
    // {
    //   id: "nautilus_navigator",
    //   display: "Nautilus Navigator",
    // },
    {
      id: "nimbus",
      display: "NIMBUS",
    },
    {
      id: "nautnavi",
      display: "NAUTILUS Navigator",
    },
    /* {
      id: "reference_point_method",
      display: "Reference Point Method",
    }, */
  ];

  let group_methods = [
    // {
    //   id: "nautilus_navigator",
    //   display: "Nautilus Navigator",
    // },
    {
      id: "nautnavi_group",
      display: "NAUTILUS Navigator",
    },
    /*{
      id: "nimbus_group",
      display: "NIMBUS",
    },*/
    /* {
      id: "reference_point_method",
      display: "Reference Point Method",
    }, */
  ];

  let tab = 0;

  export let problem: Problem;
  export let selected_method: string | undefined = undefined;
</script>

<div class="grid grid-cols-2 items-start gap-10">
  <TabGroup>
    <Tab bind:group={tab} name="single" value={0}>Single</Tab>
    <Tab bind:group={tab} name="group" value={1}>Group</Tab>

    <svelte:fragment slot="panel">
      {#if tab === 0}
        <Card>
          <svelte:fragment slot="header"
            >Available methods for single DM</svelte:fragment
          >
          <select
            class="select"
            bind:value={selected_method}
            size={Math.max(3, single_methods.length)}
          >
            {#each single_methods as method}
              <option value={method.id}>{method.display}</option>
            {/each}
          </select>
        </Card>
      {:else if tab === 1}
        <Card>
          <svelte:fragment slot="header"
            >Available methods for group of DMs</svelte:fragment
          >
          <select
            class="select"
            bind:value={selected_method}
            size={Math.max(3, group_methods.length)}
          >
            {#each group_methods as method}
              <option value={method.id}>{method.display}</option>
            {/each}
          </select>
        </Card>
      {/if}
    </svelte:fragment>
  </TabGroup>

  <ProblemDetails {problem} />
</div>
