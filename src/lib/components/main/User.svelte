<script lang="ts">
  import { login_status, username, logout, LoginStatus } from "$lib/api";
  import { selectedMethodName } from "$lib/store";
  import { goto } from "$app/navigation";

  function handleLogout() {
    logout().then(() => {
      goto("/login");
    });
  }
</script>

<div class="flex justify-between items-center w-full">
  <span class="font-bold">{$selectedMethodName}</span>

  <div class="flex gap-2">
    {#if $login_status === LoginStatus.LoggedOut}
      <span>Not logged in</span>
      <span><a class="anchor" href="/login">Log in</a></span>
    {:else}
      {#if $login_status === LoginStatus.LoggedInAsUser}
        <span>Logged in as <span class="font-bold">{$username}</span></span>
      {:else}
        <span>Logged in as a guest</span>
      {/if}
      <button class="anchor" on:click={handleLogout}>Log out</button>
    {/if}
  </div>
</div>
