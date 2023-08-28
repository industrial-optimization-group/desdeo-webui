<script lang="ts">
  //
  // TODO: The registration form could be merged with the login form.
  //

  import { register_account, login_as_guest } from "$lib/api";
  import { goto } from "$app/navigation";
  import { toastStore } from "@skeletonlabs/skeleton";

  export let username = "";
  export let password = "";
  let retyped = "";

  function handleRegistration() {
    register_account(username, password)
      .then(() => {
        goto("/");
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          toastStore.trigger({
            // prettier-ignore
            message: "Account creation failed. The username is invalid or is already in use.",
            background: "variant-filled-error",
            timeout: 5000,
          });
        } else {
          toastStore.trigger({
            // prettier-ignore
            message: "Oops! Something went wrong. Please try again later.",
            background: "variant-filled-error",
            timeout: 5000,
          });
        }
      });
  }

  //
  // TODO: This function is repeated in the login form component. It could be
  // moved to somewhere, or the component could be merged.
  //
  function handleGuestLogin() {
    login_as_guest()
      .then(() => {
        goto("/");
      })
      .catch(() => {
        toastStore.trigger({
          // prettier-ignore
          message: "Oops! Something went wrong. Please try again later.",
          background: "variant-filled-error",
          timeout: 5000,
        });
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
      placeholder="Repeat password"
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

  <div class="flex flex-col items-center">
    <span class="whitespace-nowrap"
      >Already have an account? <a href="login" class="anchor"
        >Log in to your account</a
      ></span
    >
    <span class="whitespace-nowrap"
      >or <button class="anchor" on:click={handleGuestLogin}
        >explore DESDEO as a guest</button
      ></span
    >
  </div>
</div>
