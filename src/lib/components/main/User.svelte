<script lang="ts">
  import { logged_in, username, logout } from "$lib/api";
  import { goto } from "$app/navigation";

  function handleLogout() {
    logout().then(() => {
      goto("/login");
    });
  }
</script>

<div class="flex gap-1">
  {#if $logged_in}
    <span>Logged in as <span class="font-bold">{$username}</span></span>
    <span>/</span>
    <span><button class="anchor" on:click={handleLogout}>Log out</button></span>
  {:else}
    <span>Not logged in</span>
    <span>/</span>
    <span><a class="anchor" href="/login">Log in</a></span>
  {/if}
</div>
