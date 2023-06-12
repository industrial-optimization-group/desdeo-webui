<script lang="ts">
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import type { LoginContext } from "./types";
  import logo from "$lib/assets/logo.png";
  import Citation from "$lib/components/main/Citation.svelte";

  //
  // The `login` context is used to share the current values of the username
  // and password inputs between the login form and the registration form.
  // The point is to preserve these values if the user switches from one form
  // to the other.
  //
  setContext<LoginContext>("login", {
    username: writable(""),
    password: writable(""),
  });
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
        <Citation show_bibtex_button={true} />
      </div>
    </div>
  </div>

  <div class="flex flex-col justify-center bg-white px-8 py-8">
    <slot />
  </div>
</div>
