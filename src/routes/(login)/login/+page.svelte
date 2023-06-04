<script lang="ts">
  import LoginForm from "$lib/components/main/LoginForm.svelte";
  import { getContext } from "svelte";
  import type { LoginContext } from "../types";

  const { username, password } = getContext<LoginContext>("login");
</script>

<LoginForm bind:username={$username} bind:password={$password} />
