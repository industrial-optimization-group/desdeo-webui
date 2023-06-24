<script lang="ts">
  import { clipboard } from "@skeletonlabs/skeleton";

  // The content to copy to clipboard when clicked
  export let content: string;
</script>

<!--
  Changes the background color when clicked and then transitions back to
  the original color. The intention is to indicate that something actually
  happened after the click.
-->
<button
  class="anchor transition-colors duration-1000 active:variant-soft active:duration-0"
  use:clipboard={content}>Copy to clipboard</button
>
