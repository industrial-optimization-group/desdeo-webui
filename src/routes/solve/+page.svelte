<script lang="ts">
  import { methodHeaderText, username, selectedMethod } from "$lib/api";
  import { onDestroy } from "svelte";

  import { baseURL, selectedProblem } from "$lib/api";
  import { baseURL } from "$lib/api";
  import NautilusNavigator from "$lib/components/methods/nautilus_navigator/NAUT_NAVI.svelte";
  import NautilusNavigatorGroup from "$lib/components/methods/nautilus_navigator/NAUT_NAVI_group.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";

  import { socket } from "$lib/stores.js";
  let socketVal;
  socket.subscribe((value) => {
    socketVal = value;
  });

  if ($methodHeaderText === "No method selected yet.") {
    throw new Error("No method selected yet.");
  } else if ($methodHeaderText === "nimbus") {
    throw new Error("No problem selected yet.");
  }

  if ($selectedMethod && $selectedMethod.endsWith("_group")) {
    socketVal.emit("join-room", $username, "problem-" + $selectedProblem);
  }

  onDestroy(() => {
    console.log("Solve is being destroyed");
    socketVal.emit("leave-room", $username, "problem-" + $selectedProblem);
  });
</script>

<div />

<!-- TODO: Unify styles. Until then, comment studd out -->
{#if $selectedMethod === "reference_point_method"}
  <!-- <ReferencePointMethod {problem} /> -->
{:else if $selectedMethod === "nimbus"}
  <!-- <NIMBUS
    {$selectedProblem}
    API_URL={baseURL}
    AUTH_TOKEN={get_access_token()}
  /> -->
{:else if $selectedMethod === "nautnavi"}
  <NautilusNavigator API_URL={baseURL} />
{:else if $selectedMethod === "nautnavi_group"}
  <NautilusNavigatorGroup API_URL={baseURL} />
{:else}
  <GeneralError />
{/if}
