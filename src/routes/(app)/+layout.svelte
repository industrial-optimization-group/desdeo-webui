<script>
  import { AppShell } from "@skeletonlabs/skeleton";
  import NavigationBar from "$lib/components/main/NavigationBar.svelte";
</script>

<AppShell>
  <!-- (header) -->
  <svelte:fragment slot="sidebarLeft">
    <NavigationBar />
  </svelte:fragment>
  <!-- (sidebarRight) -->
  <svelte:fragment slot="pageHeader">Page Header</svelte:fragment>
  <!-- Router Slot -->
  <slot />
  <!-- ---- / ---- -->
  <!-- (pageFooter) -->
  <!-- (footer) -->
</AppShell>
