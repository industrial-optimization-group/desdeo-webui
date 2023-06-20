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
        if (error.response && error.response.status === 400) {
          registration_error = true;
        } else {
          other_error = true;
        }
      });
  }
</script>

<div class="flex flex-col items-center gap-10">
  <div class="mb-6 text-3xl">
    Create a <span class="underline">Free</span> Account
  </div>

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
    <input
      class="input"
      class:input-error={password.length > 0 && retyped !== password}
      class:input-success={password.length > 0 && retyped === password}
      type="password"
      bind:value={retyped}
      placeholder="Confirm password"
    />
    <button
      class="btn variant-filled-primary mt-2 uppercase"
      disabled={!(() => {
        return (
          username.length > 0 && password.length > 0 && password === retyped
        );
      })()}
      on:click={handleRegistration}>Create account</button
    >
  </form>

  {#if registration_error}
    <div class="flex w-3/4 flex-col items-center text-error-500">
      <span>Account creation failed.</span>
      <span>The username is already in use or invalid.</span>
    </div>
  {:else if other_error}
    <div class="flex w-3/4 flex-col items-center text-error-500">
      <span>An unknown error occurred.</span>
      <span>Please try again later.</span>
    </div>
  {/if}

  <div class="flex flex-col items-center">
    <span class="whitespace-nowrap"
      >Already have an account? <a href="login" class="anchor"
        >Log in to your account</a
      ></span
    >
    <!--<span class="whitespace-nowrap"
      >or
      <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span
    >-->
  </div>
</div>
