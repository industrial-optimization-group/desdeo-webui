<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  // The "login" context is used to share the current values
  // of the username and password inputs between the login form
  // and the registration form. The point is to preserve
  // these values if the user switches from one form to the other.
  setContext("login", {
    username: writable(""),
    password: writable(""),
  });

  import logo from "$lib/assets/logo.png";
</script>

<div class="grid h-screen grid-cols-[1fr_auto]">
  <div class="m-8 max-w-xl">
    <div class="flex items-center gap-2">
      <img src={logo} alt="" />
      <span class="text-xl font-bold">DESDEO</span>
    </div>
    <div class="flex h-full items-center">
      <div>
        <h1 class="mb-12 text-5xl font-bold leading-snug">
          Enabling Better<br />Decision Making
        </h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
      </div>
    </div>
  </div>

  <div class="flex flex-col justify-center bg-white px-28 py-8">
    <slot />
  </div>
</div>
