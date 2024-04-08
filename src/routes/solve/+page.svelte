<script lang="ts">
  import { methodHeaderText } from "$lib/api";

  import { baseURL, get_access_token } from "$lib/api";
  import NautilusMethod from "$lib/components/methods/nautilus/NautilusMethod.svelte";
  import GeneralError from "$lib/components/util/undecorated/GeneralError.svelte";

  if ($methodHeaderText === "No method selected yet.") {
    throw new Error("No method selected yet.");
  } else if ($methodHeaderText === "nimbus") {
    throw new Error("No problem selected yet.");
  }
</script>

<div />

<!-- TODO: Unify styles. Until then, comment studd out -->
{#if $methodHeaderText === "Reference Points Method"}
  <!-- <ReferencePointMethod {problem} /> -->
{:else if $methodHeaderText === "NIMBUS"}
  <!-- <NIMBUS
      {$selectedProblem}
      API_URL={baseURL}
      AUTH_TOKEN={get_access_token()}
    /> -->
{:else if $methodHeaderText === "NAUTILUS"}
  <NautilusMethod API_URL={baseURL} AUTH_TOKEN={get_access_token()} />
{:else}
  <GeneralError />
{/if}
