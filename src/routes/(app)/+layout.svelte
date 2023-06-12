<script lang="ts">
  import { AppShell } from "@skeletonlabs/skeleton";
  import Header from "$lib/components/main/Header.svelte";
  import Navigation from "$lib/components/main/Navigation.svelte";
</script>

<AppShell slotPageContent="p-2" slotPageHeader="shadow">
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
