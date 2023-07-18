<script lang="ts">
  import { drawerStore } from "@skeletonlabs/skeleton";
  import { AppShell } from "@skeletonlabs/skeleton";
  import Header from "$lib/components/main/Header.svelte";
  import Navigation from "$lib/components/main/Navigation.svelte";
</script>

<AppShell slotPageContent="p-20 pt-10" slotPageHeader="bg-white shadow-md">
  <!-- (header) -->
  <svelte:fragment slot="sidebarLeft">
    <Navigation />
  </svelte:fragment>
  <!-- (sidebarRight) -->
  <svelte:fragment slot="pageHeader">
    <Header />
  </svelte:fragment>
  <!-- Router Slot -->
  <slot />
  <!-- ---- / ---- -->
  <!-- (pageFooter) -->
  <!-- (footer) -->
</AppShell>

<button
  class="btn variant-filled-tertiary fixed bottom-0 right-0"
  on:click={() => {
    drawerStore.open();
  }}>How to cite DESDEO?</button
>
