<script lang="ts">
  import ConstraintInput from "./ConstraintInput.svelte";
  import NewButton from "./NewButton.svelte";
  import DeleteButton from "./DeleteButton.svelte";
  import type { Definition } from "./NewProblem.svelte";

  export let constraints: Definition[] = [];

  function add_constraint() {
    constraints = [
      ...constraints,
      {
        _id: crypto.randomUUID(),
        name: "",
        value: undefined,
        description: "",
      },
    ];
  }

  function remove_definition(_id: string) {
    constraints = constraints.filter((constraint) => constraint._id !== _id);
  }

  let show_help = false;
</script>

<div class="flex flex-col items-start gap-4">
  <div class="underline">
    Constraints
    <button
      class="border border-black px-1"
      on:click={() => {
        show_help = !show_help;
      }}>?</button
    >
  </div>
  {#if show_help}
    <div class="max-w-xs">
      Constraint expressions may refer to constants, variables and objectives.
    </div>
  {/if}
  {#each constraints as { _id, name, value, description } (_id)}
    <div class="flex items-start gap-1">
      <DeleteButton on:click={() => remove_definition(_id)} />
      <ConstraintInput bind:name bind:value bind:description />
    </div>
  {/each}

  <NewButton on:click={add_constraint} />
</div>
