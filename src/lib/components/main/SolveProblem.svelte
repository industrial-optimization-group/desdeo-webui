<script lang="ts">
  import ReferencePointMethod from "../methods/ReferencePointMethod.svelte";
  import type { Problem } from "$lib/api";

  export let problem: Problem;
</script>

<ReferencePointMethod {problem} />
