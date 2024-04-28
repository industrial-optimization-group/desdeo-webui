<script lang="ts">
  import { methodHeaderText } from "$lib/api";
  import Navigation from "$lib/components/main/Navigation.svelte";
  import User from "$lib/components/main/User.svelte";
  import { AppShell } from "@skeletonlabs/skeleton";
</script>

<AppShell
  slotSidebarLeft="top-0 w-20 h-full float-left z-10"
  regionPage="flex-col left-20 z-1 h-screen"
  slotPageHeader="bg-white shadow-md border-b h-10 z-9 left-20 flex-row"
  slotPageContent="p-0 bg-white flex-row overflow-y-auto h-full"
>
  <svelte:fragment slot="sidebarLeft"><Navigation /></svelte:fragment>
  <svelte:fragment slot="pageHeader">
    <div class="flex justify-between">
      <div class="flex justify-start gap-1 p-2">
        <strong>{$methodHeaderText.boldPart}</strong>
        <em>{$methodHeaderText.italicPart}</em>
      </div>
      <div class="ml-auto p-2">
        <a href={$methodHeaderText.moreInfo} target="_blank" class="anchor"
          >{$methodHeaderText.moreInfoText}</a
        >
      </div>
      <div class="flex justify-end p-2"><User /></div>
    </div>
  </svelte:fragment>
  <slot />
</AppShell>
