<script lang="ts">
  // Fake data to experiment with

  // import Paginator from "./Paginator.svelte";
  import { Table, type TableSource } from "@skeletonlabs/skeleton";
  import { tableMapperValues } from "@skeletonlabs/skeleton";

  // const items_per_page = 10;
  // let start: number;
  // let endExclusive: number;
  let tableSimple: TableSource;
  export let selectedSolutions: number[] = [];

  // $: paginatedProblems = selectedSolutions.slice(start, endExclusive);
  // $: paginatedProblems = problems.slice(start, endExclusive);

  $: tableSimple = {
    head: ["Solution", "Values"],
    body: tableMapperValues(selectedSolutions, ["name", "value"]),
    // Optional: The data returned when interactive is enabled and a row is clicked.
    meta: tableMapperValues(selectedSolutions, ["name", "value"]),
    // Optional: A list of footer labels.
    //foot: ["Total", "", '<code class="code">5</code>'],
  };

  function handleSelection(event: CustomEvent) {
    console.log(event.detail);
  }
</script>

<div class={$$props.class}>
  <!-- <dev class="flex justify-end">
    <Paginator
      total_items={problems.length}
      {items_per_page}
      bind:start
      bind:endExclusive
    />
  </dev> -->
  <Table
    source={tableSimple}
    interactive={true}
    on:selected={handleSelection}
  />
</div>
