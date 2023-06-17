<script>
  import "@skeletonlabs/skeleton/themes/theme-hamlindigo.css";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "../app.postcss";
  import { Drawer, drawerStore } from "@skeletonlabs/skeleton";
  import Citation from "$lib/components/main/Citation.svelte";
  import CitationDownload from "$lib/components/main/CitationDownload.svelte";

  function closeDrawer() {
    drawerStore.close();
  }
</script>

<Drawer position="bottom">
  <div class="h-full p-4">
    <div class="mb-4 flex justify-between">
      <span class="font-bold">Citing DESDEO</span>
      <button class="anchor" on:click={closeDrawer}>Close</button>
    </div>
    <div class="grid max-w-screen-xl grid-cols-2">
      <!--
        TODO: Use the theme system instead of a hardcoded color?
      -->
      <div class="border-r border-black pr-4">
        <Citation />
      </div>
      <div class="pl-4">
        <CitationDownload />
      </div>
    </div>
  </div>
</Drawer>

<slot />
