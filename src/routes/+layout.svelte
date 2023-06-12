<script>
  import "@skeletonlabs/skeleton/themes/theme-hamlindigo.css";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "../app.postcss";
  import { Drawer } from "@skeletonlabs/skeleton";
  import Citation from "$lib/components/main/Citation.svelte";
  import CitationDownload from "$lib/components/main/CitationDownload.svelte";
</script>

<Drawer position="bottom">
  <div class="h-full max-w-screen-xl p-4">
    <div class="mb-4 font-bold">Citing DESDEO</div>
    <div class="grid grid-cols-2">
      <!--
        TODO: Use the theme system instead a hardcoded color?
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
