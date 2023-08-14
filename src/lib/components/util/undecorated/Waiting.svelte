<!--
@component
A simple animated circle to indicate an ongoing action.

@slot label [An optional label to show next to the circle.]
-->
<script lang="ts">
  import { ProgressRadial } from "@skeletonlabs/skeleton";
</script>

<div class="flex items-center gap-2">
  <ProgressRadial stroke={200} width="w-6" />
  {#if $$slots.label}
    <slot name="label" />
  {/if}
</div>
