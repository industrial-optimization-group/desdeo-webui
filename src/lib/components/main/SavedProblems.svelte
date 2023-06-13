<script lang="ts">
  // Fake data to experiment with
  const problems = [
    {
      id: 1,
      name: "Problem 1",
      problem_type: "Continuous",
    },
    {
      id: 2,
      name: "Problem 2",
      problem_type: "Continuous",
    },
    {
      id: 3,
      name: "Problem 3",
      problem_type: "Continuous",
    },
    {
      id: 4,
      name: "Problem 4",
      problem_type: "Continuous",
    },
    {
      id: 5,
      name: "Problem 5",
      problem_type: "Continuous",
    },
    {
      id: 6,
      name: "Problem 6",
      problem_type: "Continuous",
    },
    {
      id: 7,
      name: "Problem 7",
      problem_type: "Continuous",
    },
    {
      id: 8,
      name: "Problem 8",
      problem_type: "Continuous",
    },
    {
      id: 9,
      name: "Problem 9",
      problem_type: "Continuous",
    },
    {
      id: 10,
      name: "Problem 10",
      problem_type: "Continuous",
    },
    {
      id: 11,
      name: "Problem 11",
      problem_type: "Continuous",
    },
    {
      id: 12,
      name: "Problem 12",
      problem_type: "Continuous",
    },
    {
      id: 13,
      name: "Problem 13",
      problem_type: "Continuous",
    },
  ];

  import Paginator from "./Paginator.svelte";
  import { Table, type TableSource } from "@skeletonlabs/skeleton";
  import { tableMapperValues } from "@skeletonlabs/skeleton";

  const items_per_page = 10;
  let start: number;
  let endExclusive: number;
  let tableSimple: TableSource;

  $: paginatedProblems = problems.slice(start, endExclusive);

  $: tableSimple = {
    head: ["Name", "Problem type"],
    body: tableMapperValues(paginatedProblems, ["name", "problem_type"]),
    // Optional: The data returned when interactive is enabled and a row is clicked.
    // meta: tableMapperValues(sourceData, [
    //   "position",
    //   "name",
    //   "symbol",
    //   "weight",
    // ]),
    // Optional: A list of footer labels.
    //foot: ["Total", "", '<code class="code">5</code>'],
  };
</script>

<div class={$$props.class}>
  <dev class="flex justify-end">
    <Paginator
      total_items={problems.length}
      {items_per_page}
      bind:start
      bind:endExclusive
    />
  </dev>
  <Table source={tableSimple} interactive={true} />
</div>
