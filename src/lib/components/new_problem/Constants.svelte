<script lang="ts">
  import DefinitionList from "./DefinitionList.svelte";
  import type { Definition } from "./NewProblem.svelte";

  export let constants: Definition[] = [];
  let show_help = false;
</script>

<div class="flex flex-col items-start gap-4">
  <div class="underline">
    Constants
    <button
      class="border border-black px-1"
      on:click={() => {
        show_help = !show_help;
      }}>?</button
    >
  </div>
  {#if show_help}
    <div class="max-w-xs">
      Constant expressions may refer to other constants, but the defnitions may
      not be circular.
    </div>
  {/if}
  <DefinitionList bind:definitions={constants} />
</div>
