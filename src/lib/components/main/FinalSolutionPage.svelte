<!--
@component
A user interface for the final solution page.
-->
<script lang="ts">
  import type { Problem, Point } from "$lib/api";
  import { onMount } from 'svelte';
  import ProblemDetails from '$lib/components/main/ProblemDetails.svelte';

  export let problem: Problem;
  let finalSolution: Point = [];

  onMount(() => {
    // Fetch and parse the final solution from the URL, state management, or wherever it's stored
    const params = new URLSearchParams(window.location.search);
    const solutionParam = params.get('solution');
    if (solutionParam) {
      finalSolution = JSON.parse(decodeURIComponent(solutionParam));
    }
  });
</script>

{#if finalSolution}
  <div class="final-solution-container">
    <ProblemDetails {problem} />
    <h2>Final Solution</h2>
    <pre>{JSON.stringify(finalSolution, null, 2)}</pre>
  </div>
{:else}
  <div>No solution found.</div>
{/if}
