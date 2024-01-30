<script>
  //
  // The main theme
  //
  // TODO: Implement the design with a custom theme. It is probably best to
  // wait until v2 of Skeleton is published, since there will be changes to
  // the theming system.
  //
  // See https://www.skeleton.dev/docs/generator.
  //
  import "@skeletonlabs/skeleton/themes/theme-hamlindigo.css";

  // Contains the bulk of Skeleton's required styles
  import "@skeletonlabs/skeleton/styles/skeleton.css";

  // The application's global stylesheet
  import "../app.postcss";

  // Math fonts for the MathLive component
  //
  // TODO: Should we somehow load the sound files too to suppress the errors
  // related to them? Or is there a way to disable the sound feature?
  //
  import "mathlive/fonts.css";

  import { Drawer, Modal, drawerStore } from "@skeletonlabs/skeleton";
  import { Toast } from "@skeletonlabs/skeleton";
  import Citation from "$lib/components/main/Citation.svelte";
  import CitationDownload from "$lib/components/main/CitationDownload.svelte";
  import CloseButton from "$lib/components/main/CloseButton.svelte";
</script>

<!--
  -- NOTE: The drawer feature uses a singleton pattern, so the drawer component
  -- should not be used anywhere but here. 
  -->
<Drawer position="bottom">
  <div class="min-h-full p-4">
    <div class="mb-4 flex justify-between">
      <span class="font-bold">Citing DESDEO</span>
      <CloseButton
        aria-label="Close drawer"
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

<!--
  -- NOTE: The toast feature uses a singleton pattern, so the toast component
  -- should not be used anywhere but here. 
  --
  -- NOTE: The dismiss button's styling should be kept in sync with the general
  -- close button's styling (see `CloseButton.svelte`).
  -->
<Toast />
<Modal />

<slot />
