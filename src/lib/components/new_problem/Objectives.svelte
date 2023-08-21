<script lang="ts">
  import HelpButton from "../util/undecorated/HelpButton.svelte";
  import DefinitionList from "./DefinitionList.svelte";
  import type { Definition } from "./NewProblem.svelte";

  export let objectives: Definition[] = [];
  let show_help = false;
</script>

<div class="flex flex-col items-start gap-4">
  <div class="underline">
    Objectives <HelpButton
      on:click={() => {
        show_help = !show_help;
      }}
    />
  </div>
  {#if show_help}
    <div class="max-w-xs">
      Objective expressions may refer to variables and constants. They may also
      refer to other objectives, but the definitions may not be circular.
    </div>
  {/if}
  <DefinitionList bind:definitions={objectives} />
</div>
