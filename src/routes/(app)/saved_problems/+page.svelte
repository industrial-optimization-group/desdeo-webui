<script lang="ts">
  import { get_all_problems } from "$lib/api";

  import Solve from "$lib/components/main/Solve.svelte";
  import Waiting from "$lib/components/util/undecorated/Waiting.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";
</script>

{#await get_all_problems()}
  <Waiting>
    <span slot="label">Loading problems...</span>
  </Waiting>
{:then problems}
  <Solve {problems} />
{:catch err}
  <GeneralError {err} />
{/await}
