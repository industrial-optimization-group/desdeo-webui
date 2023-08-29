<script lang="ts">
  /** Heading values. */
  export let head: string[];

  /** Body values. */
  export let body: string[][];
</script>

<table class="table">
  <thead>
    {#each head as item}
      <th>{item}</th>
    {/each}
  </thead>
  {#each body as row}
    <tr class="table-row">
      {#each row as item}
        <td class="table-cell">{item}</td>
      {/each}
    </tr>
  {/each}
</table>
