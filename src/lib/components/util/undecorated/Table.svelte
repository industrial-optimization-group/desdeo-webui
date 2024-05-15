<!--
@component
A simple table.
-->
<script lang="ts">
  /** Heading values. */
  export let head: string[];

  /** Body values. */
  export let body: string[][];

  /** Indexes of the selected rows. */
  export let selected_rows: number[] = [];

  //
  // The following are utility functions that were faster to write than look for
  // existing implementations.
  //
  // TODO: Move to some location where they can be used by other parts of the
  // codebase if desired.
  //

  function is_in<T>(arr: T[], e: T): boolean {
    return arr.findIndex((v) => v === e) !== -1;
  }

  function remove<T>(arr: T[], e: T): T[] {
    return arr.filter((v) => v !== e);
  }

  /**
   * Adds an element to the end if not already in the array. Existing element is
   * moved to the end.
   */
  function add<T>(arr: T[], e: T): T[] {
    return [...remove(arr, e), e];
  }

  function toggle<T>(arr: T[], e: T): T[] {
    return is_in(arr, e) ? remove(arr, e) : add(arr, e);
  }

  $: displayedHead = ['Id', ...head]; // Prepends "Id" to the array of headers.
</script>

<table class="table-comfortable">
  <thead class="bg-surface-200">
    {#each displayedHead as item}
      <th class="p-4">{item}</th>
    {/each}
  </thead>
  <tbody class="text-sm">
    {#each body as row, row_id}
      {@const background = is_in(selected_rows, row_id)
        ? "bg-surface-400"
        : "bg-surface-100"}
      <tr class="border-b-2 border-surface-200 {background} last:border-none hover:cursor-pointer">
        <!-- Render the Solution Id -->
        <td class="table-cell text-center">{`Solution ${row_id + 1}`}</td>
        
        {#each row as item}
          <td class="table-cell text-center" on:click={() => { selected_rows = toggle(selected_rows, row_id); }}>
            {item}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .first-cell {
    padding-left: 20px; /* Adjust the padding value as needed */
  }
  .table-cell {
    padding: 4px 10px; /* Adjust padding for other cells */
  }
</style>
