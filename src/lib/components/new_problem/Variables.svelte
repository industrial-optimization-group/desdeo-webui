<script lang="ts">
  import VariableInput from "./VariableInput.svelte";
  import NewButton from "./NewButton.svelte";
  import DeleteButton from "./DeleteButton.svelte";
  import type { Variable } from "./NewProblem.svelte";

  export let variables: Variable[] = [];

  function add_variable() {
    variables = [
      ...variables,
      {
        _id: crypto.randomUUID(),
        name: "",
        kind: "continuous",
        description: "",
      },
    ];
  }

  function remove_variable(_id: string) {
    variables = variables.filter((variable) => variable._id !== _id);
  }
</script>

<div class="flex flex-col items-start gap-4">
  <div class="underline">Variables</div>

  {#each variables as { _id, name, kind, description } (_id)}
    <div class="flex items-start gap-1">
      <DeleteButton on:click={() => remove_variable(_id)} />
      <VariableInput bind:name bind:kind bind:description />
    </div>
  {/each}

  <NewButton on:click={add_variable} />
</div>
