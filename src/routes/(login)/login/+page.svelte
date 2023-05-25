<script>
  import LoginForm from "$lib/components/main/LoginForm.svelte";
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

  <div class="flex flex-col justify-center bg-white px-20 py-8">
    <div class="flex flex-col items-center gap-8">
      <div class="mb-6 text-2xl">Log in to Your Account</div>
      <LoginForm />
      <div class="flex flex-col items-center">
        <span
          >Don't have an account? <a href="/TODO" class="anchor"
            >Register a free account</a
          ></span
        >
        <span
          >or <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span
        >
      </div>
    </div>
  </div>
</div>
