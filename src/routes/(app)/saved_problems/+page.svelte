<script lang="ts">
  import { get_all_problems, allProblems } from "$lib/api";
  import type { Problem } from "$lib/api";
  import { onMount } from "svelte";

  import Solve from "$lib/components/main/Solve.svelte";
  import Waiting from "$lib/components/util/undecorated/Waiting.svelte";

  onMount(async () => {
    await get_all_problems();
  });

  let problems = $allProblems;

  allProblems.subscribe((value: Problem[]) => {
    problems = value;
    console.log("problems", problems);
  });
</script>

{#if problems}
  <Solve {problems} />
{:else}
  <Waiting>
    <span slot="label">Loading problems...</span>
  </Waiting>
{/if}
