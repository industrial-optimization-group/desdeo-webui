<script lang="ts">
  export let username = "";
  export let password = "";
</script>

<div class="flex flex-col items-center gap-8">
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
    <button class="btn variant-filled-primary mt-2 uppercase">Log in</button>
  </form>
  <div class="flex flex-col items-center">
    <span>Don't have an account?</span>
    <span><a href="/register" class="anchor">Register a free account</a></span>
    <span>or <a href="/TODO" class="anchor">explore DESDEO as a guest</a></span>
  </div>
</div>
