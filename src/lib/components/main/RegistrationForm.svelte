<script lang="ts">
  export let username = "";
  export let password = "";

  let retyped = "";
</script>

<div class="flex flex-col items-center gap-8">
  <div class="mb-6 text-2xl">
    Register a <span class="underline">Free</span> Account
  </div>
  <form class="flex w-72 flex-col gap-4">
    <input type="text" bind:value={username} placeholder="Username" />
    <input type="password" bind:value={password} placeholder="Password" />
    <input type="password" bind:value={retyped} placeholder="Retype password" />
    <button class="btn variant-filled-primary mt-2 uppercase">Register</button>
  </form>
  <div class="flex flex-col items-center">
    <span>Already have an account? </span>
    <span
      ><a href="login" class="anchor">Log in</a> or
      <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span
    >
  </div>
</div>
