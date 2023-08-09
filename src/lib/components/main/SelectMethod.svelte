<script lang="ts">
  import Card from "./Card.svelte";

  type Method = {
    id: string;
    text: string;
  };

  //
  // TODO: The backend doesn't currently support selecting the available
  // methods based on the problem.
  //
  let methods: Method[] = [
    {
      id: "reference_point_method",
      text: "Reference Point Method",
    },
    {
      id: "nautilus_navigator",
      text: "Nautilus Navigator",
    },
  ];

  let selected_method: Method;
</script>

<div class="grid grid-cols-2 gap-10">
  <Card>
    <svelte:fragment slot="header">Available methods</svelte:fragment>
    <select class="select" bind:value={selected_method}>
      {#each methods as method}
        <option value={method}>{method.text}</option>
      {/each}
    </select>
  </Card>
</div>
