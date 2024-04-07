<script lang="ts">
  import User from "$lib/components/main/User.svelte";
  export let method: string;
</script>

<div class="flex {method.length ? 'justify-between' : 'justify-end'} p-2">
  {#if method}
    <span class="font-bold">{method}</span>
  {/if}
  <User />
</div>
