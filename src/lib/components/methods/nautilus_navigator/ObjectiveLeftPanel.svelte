<!--
@component
The left-hand side panel of the navigation bar.

TODO: Do we want to put restrictions on the aspiration and bound values that
the user can choose?
-->
<script lang="ts">
  export let name: string;
  export let best_reachable: number;
  export let worst_reachable: number;
  export let aspiration: number | undefined;
  export let bound: number | undefined;

  const aspiration_id = crypto.randomUUID();
  const bound_id = crypto.randomUUID();
</script>

<div class="flex flex-col gap-2 bg-surface-300 p-4">
  <div class="font-bold">{name}</div>
  <hr class="h-1 bg-surface-400" />
  <div>Best reachable value: {best_reachable}</div>
  <div class="grid grid-cols-[1fr_auto] items-center gap-2 gap-x-10">
    <label for={aspiration_id}>Aspiration</label>
    <input id={aspiration_id} type="number" bind:value={aspiration} />
    <label for={bound_id}>Bound</label>
    <input id={bound_id} type="number" bind:value={bound} />
  </div>
  <div>Worst reachable value: {worst_reachable}</div>
</div>
