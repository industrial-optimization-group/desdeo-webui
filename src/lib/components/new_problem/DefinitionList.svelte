<script lang="ts">
  import DefinitionInput from "./DefinitionInput.svelte";
  import NewButton from "./NewButton.svelte";
  import DeleteButton from "./DeleteButton.svelte";
  import type { Definition } from "./NewProblem.svelte";

  export let definitions: Definition[] = [];

  function add_definition() {
    definitions = [
      ...definitions,
      {
        _id: crypto.randomUUID(),
        name: "",
        value: undefined,
        description: "",
      },
    ];
  }

  function remove_definition(_id: string) {
    definitions = definitions.filter((definition) => definition._id !== _id);
  }
</script>

<div class="flex flex-col items-start gap-4">
  {#each definitions as { _id, name, value, description } (_id)}
    <div class="flex items-start gap-1">
      <DeleteButton on:click={() => remove_definition(_id)} />
      <DefinitionInput bind:name bind:value bind:description />
    </div>
  {/each}

  <NewButton on:click={add_definition} />
</div>
