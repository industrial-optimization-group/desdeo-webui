<script lang="ts">
  export let name: string;
  export let placeholder = "Name";

  /** Classes for setting the input's width. */
  export let width = "max-w-[10em]";
</script>

<input type="text" class="input {width}" bind:value={name} {placeholder} />
