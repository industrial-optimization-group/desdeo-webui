<script>
  import { AppShell } from "@skeletonlabs/skeleton";
  import Header from "$lib/components/main/Header.svelte";
  import NavigationBar from "$lib/components/main/NavigationBar.svelte";
</script>

<AppShell slotPageContent="p-2" slotPageHeader="shadow">
  <!-- (header) -->
  <svelte:fragment slot="sidebarLeft">
    <NavigationBar />
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
