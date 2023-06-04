<script lang="ts">
  import { register_account } from "$lib/api";
  import { goto } from "$app/navigation";

  export let username = "";
  export let password = "";

  let retyped = "";

  let registration_error = false;
  let other_error = false;

  function handleRegistration() {
    registration_error = false;
    other_error = false;

    register_account(username, password)
      .then(() => {
        goto("/");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          registration_error = true;
        } else {
          other_error = true;
        }
      });
  }
</script>

<div class="flex flex-col items-center gap-8">
  <div class="mb-6 text-2xl">
    Register a <span class="underline">Free</span> Account
  </div>
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
    <input
      class="input"
      type="password"
      bind:value={retyped}
      placeholder="Retype password"
    />
    <button
      class="btn variant-filled-primary mt-2 uppercase"
      on:click={handleRegistration}>Register</button
    >
  </form>
  {#if registration_error}
    <div class="text-center text-error-500">
      Registration attempt failed. The username is invalid or is already taken.
    </div>
  {:else if other_error}
    <div class="text-center text-error-500">
      An unknown error occurred. Please try again later.
    </div>
  {/if}
  <div class="flex flex-col items-center">
    <span>Already have an account? </span>
    <span
      ><a href="login" class="anchor">Log in</a> or
      <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span
    >
  </div>
</div>
