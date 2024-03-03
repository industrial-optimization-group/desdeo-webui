<script lang="ts">
</script>

<!-- Create a layout with two columns with widths 1:2. -->
<!-- The first column should be gray, take up the full vertical height, and be scrollable -->

<div class="mr-3 flex h-full flex-row p-0">
  <div class=" h-full w-1/3 flex-col overflow-y-scroll bg-gray-300 p-3">
    <slot name="preference" />
  </div>
  <div class="h-full w-2/3 overflow-y-scroll bg-white p-3">
    <slot name="visualization" />
  </div>
</div>
