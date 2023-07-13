<script>
  // The selected theme
  import "@skeletonlabs/skeleton/themes/theme-hamlindigo.css";

  // Contains the bulk of Skeleton's required styles
  import "@skeletonlabs/skeleton/styles/skeleton.css";

  // The application's global stylesheet
  import "../app.postcss";

  import { Drawer, drawerStore } from "@skeletonlabs/skeleton";
  import Citation from "$lib/components/main/Citation.svelte";
  import CitationDownload from "$lib/components/main/CitationDownload.svelte";
  import CloseButton from "$lib/components/main/CloseButton.svelte";
</script>

<Drawer position="bottom">
  <div class="h-full p-4">
    <div class="mb-4 flex justify-between">
      <span class="font-bold">Citing DESDEO</span>
      <CloseButton
        on:click={() => {
          drawerStore.close();
        }}
      />
    </div>
    <div class="grid max-w-screen-xl grid-cols-2">
      <!--  TODO: Use the theme system instead of a hardcoded color value? -->
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
