<script lang="ts">
  import { login, login_as_guest } from "$lib/api.js";
  import { goto } from "$app/navigation";
  import { toastStore } from "@skeletonlabs/skeleton";

  export let username = "";
  export let password = "";

  function handleLogin() {
    login(username, password)
      .then(() => {
        goto("/");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          toastStore.trigger({
            // prettier-ignore
            message: "Login attempt failed. Please check your username and password.",
            background: "variant-filled-error",
            timeout: 5000,
          });
        } else {
          toastStore.trigger({
            // prettier-ignore
            message: "Oops! Something went wrong. The server could be unreachable. Please try again later.",
            background: "variant-filled-error",
            timeout: 5000,
          });
        }
      });
  }

  // TODO: This function is repeated in the registration form component
  function handleGuestLogin() {
    login_as_guest()
      .then(() => {
        goto("/");
      })
      .catch(() => {
        toastStore.trigger({
          // prettier-ignore
          message: "Oops! Something went wrong. The server could be unreachable. Please try again later.",
          background: "variant-filled-error",
          timeout: 5000,
        });
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

  <div class="flex flex-col items-center">
    <span class="whitespace-nowrap"
      >Don't have an account? <a href="/create_account" class="anchor"
        >Create a free account</a
      ></span
    >
    <span class="whitespace-nowrap"
      >or <button class="anchor" on:click={handleGuestLogin}
        >explore DESDEO as a guest</button
      ></span
    >
  </div>
</div>
