<!--
@component
A component for showing a customizable error message with general defaults.
A title can be provided in the `title` slot.

@param err
An optional error of type `Error`. Will be printed to the error console.
-->
<script lang="ts">
  /** @readonly */
  export let err: Error | undefined = undefined;

  $: if (err) {
    console.error(err);
  }
</script>

<div class="alert variant-filled-error max-w-3xl">
  <div class="alert-message">
    <div class="font-bold">
      <slot name="title">Error</slot>
    </div>
    <div>
      <slot>Oops! Something went wrong.</slot>
    </div>
  </div>
</div>
