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
    justify-items: center;
  }
  .readonly {
    background: transparent;
    border: none;
    overflow: visible;
    padding: 0;
    margin-left: 0.5em;
    align-self: center;
    font-size: small;
  }

  input {
    width: inherit;
    height: 1.4em;
    border-radius: 4px;
    border: 1px solid #ccc;
    overflow: visible;
    color: gray;
    font-weight: 600;
  }

  label {
    color: gray;
    font-size: small;
    margin-bottom: 0.25em;
  }
  /* .error{
    color: red;
  } */
</style>
