<script lang="ts">
  import ProblemDetails from "./ProblemDetails.svelte";
  import Card from "./Card.svelte";
  import type { Problem } from "$lib/api";

  let methods = [
    // {
    //   id: "nautilus_navigator",
    //   display: "Nautilus Navigator",
    // },
    // {
    //   id: "nimbus",
    //   display: "NIMBUS",
    // },
    {
      id: "nautilus",
      display: "NAUTILUS",
    },
    {
      id: "reference_point_method",
      display: "Reference Point Method",
    },
  ];

  export let problem: Problem;
  export let selected_method: string | undefined = undefined;
</script>

<div class="grid grid-cols-2 items-start gap-10">
  <Card>
    <svelte:fragment slot="header">Available methods</svelte:fragment>
    <select
      class="select"
      bind:value={selected_method}
      size={Math.max(3, methods.length)}
    >
      {#each methods as method}
        <option value={method.id}>{method.display}</option>
      {/each}
    </select>
  </Card>

  <ProblemDetails {problem} />
</div>
