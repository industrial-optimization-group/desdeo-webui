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

<div class="flex flex-col items-center gap-10">
  <div class="mb-6 text-3xl">Log in to Your Account</div>
  <form class="mx-24 flex w-72 flex-col gap-4">
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
    <div class="flex w-3/4 flex-col items-center text-error-500">
      <span>Login attempt failed.</span>
      <span>Please check your username and password.</span>
    </div>
  {:else if other_error}
    <div class="flex w-3/4 flex-col items-center text-error-500">
      <span>An unknown error occurred.</span>
      <span>Please try again later.</span>
    </div>
  {/if}

  <div class="flex flex-col items-center">
    <span class="whitespace-nowrap"
      >Don't have an account? <a href="/create_account" class="anchor"
        >Create a free account</a
      ></span
    >
    <!--<span class="whitespace-nowrap"
      >or <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span
    >-->
  </div>
</div>
