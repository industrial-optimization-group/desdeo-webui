<script lang="ts">
  import type { Problem } from "$lib/api";
  import { selectedMethodName } from '$lib/store';

  export let problem: Problem;
  export let method: string;

  // import NautilusNavigator from "$lib/components/methods/nautilus_navigator/NautilusNavigator.svelte";
  // import NIMBUS from "$lib/components/methods/nimbus/NIMBUS.svelte";
  import IRVEAMethod from "$lib/components/methods/irvea_method/IRVEAMethod.svelte";
  import GeneralError from "../util/undecorated/GeneralError.svelte";

  selectedMethodName.set('Interactive RVEA');
</script>

<!--
  -- TODO: It would probably be better to pass in a method component and then
  -- render it here.
-->

<!-- {#if method === "nautilus_navigator"} -->
<!--   <NautilusNavigator {problem} /> -->
<!-- {:else if method === "nimbus"} -->
<!--   <NIMBUS {problem} /> -->
<!-- {:else if method === "reference_point_method"} -->
{#if method === "reference_point_method"}
  <IRVEAMethod {problem} />
{:else}
  <GeneralError />
{/if}
