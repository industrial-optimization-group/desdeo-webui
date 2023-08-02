<script lang="ts">
  export let value: number;
  export let higherBound: number;
  export let lowerBound: number;
  export let labelName = "Value: ";
  export let readonly = false;
</script>

{#if readonly}
  <input
    class="readonly"
    name="box"
    type="number"
    min={lowerBound}
    max={higherBound}
    readonly
    bind:value
  />
{:else}
  <div class="ts">
    <label for="box"> {labelName}</label>
    <input
      name="box"
      type="number"
      min={lowerBound}
      max={higherBound}
      bind:value
    />
  </div>
{/if}

<style>
  div {
    display: flex;
    flex-direction: column;

    /* align-items: center; */
  }
  .readonly {
    background: transparent;
    border: none;
    overflow: visible;
    padding: 0;
    margin-left: 0.5em;
  }

  input {
    width: inherit;
    height: 1.5em;
    border-radius: 2px;
    border: 1px solid #ccc;
    overflow: visible;
  }
  /* .error{
    color: red;
  } */
</style>
