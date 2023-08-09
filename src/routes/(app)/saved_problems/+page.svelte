<script lang="ts">
  import Solve from "$lib/components/main/Solve.svelte";
  import { setContext } from "svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  setContext("desdeo_problems", data.desdeo_problems);
</script>

<Solve />
