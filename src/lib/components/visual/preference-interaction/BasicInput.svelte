<!-- TODO: Implement input value validation -->
<script lang="ts">
  export let value: number | undefined;
  export let higherBound: number;
  export let lowerBound: number;
  export let labelName = "Value: ";
</script>

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

<style>
  div {
    display: flex;
    flex-direction: column;
    justify-items: center;
    width: 100%;
  }

  input {
    width: inherit;
    height: 1.4em;
    border-radius: 4px;
    border: 1px solid #ccc;
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
