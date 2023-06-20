<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import SavedProblems from "$lib/components/main/SavedProblems.svelte";

  let tabSet = 0;
</script>

<TabGroup>
  <Tab bind:group={tabSet} name="tab1" value={0}>Your saved problems</Tab>
  <Tab bind:group={tabSet} name="tab2" value={1}
    >Problems provided by DESDEO</Tab
  >
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      <SavedProblems class="max-w-screen-md" />
    {:else if tabSet === 1}
      <SavedProblems />
    {/if}
  </svelte:fragment>
</TabGroup>
