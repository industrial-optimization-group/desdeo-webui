<script lang="ts">
  import { login } from "$lib/api.js";
  import { goto } from "$app/navigation";

  export let username = "";
  export let password = "";

  let auth_error = false;
  let other_error = false;

  function handleLogin() {
    auth_error = false;
    other_error = false;
    login(username, password)
      .then(() => {
        goto("/");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          auth_error = true;
        } else {
          other_error = true;
        }
      });
  }
</script>

<div class="flex max-w-min flex-col items-center gap-8">
  <div class="mb-6 text-2xl">Log in to Your Account</div>
  <form class="flex w-72 flex-col gap-4">
    <input
      class="input"
      type="text"
      bind:value={username}
      placeholder="Username"
    />
    <input
      class="input"
      type="password"
      bind:value={password}
      placeholder="Password"
    />
    <button
      class="btn variant-filled-primary mt-2 uppercase"
      disabled={!(() => {
        return username.length > 0 && password.length > 0;
      })()}
      on:click={handleLogin}>Log in</button
    >
  </form>
  {#if auth_error}
    <div class="text-center text-error-500">
      Login attempt failed. Please check your username and password.
    </div>
  {:else if other_error}
    <div class="text-center text-error-500">
      An error occurred. Please try again later.
    </div>
  {/if}
  <div class="flex flex-col items-center">
    <span>Don't have an account?</span>
    <span><a href="/register" class="anchor">Register a free account</a></span>
    <span>or <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span>
  </div>
</div>
