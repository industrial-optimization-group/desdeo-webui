<script lang="ts">
  export let data;
  import { goto } from "$app/navigation";
  import { loginWithInvite } from "$lib/api";
  import { onMount } from "svelte";
  onMount(async () => {
    await login();
  });
  async function login() {
    if (data.invite_code === "fake-invite_code") {
      goto("/");
      return;
    }
    loginWithInvite(data.invite_code)
      .then(() => {
        goto("/saved_problems");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.log(error);
        } else {
          console.log("error");
        }
      });
  }
</script>

<div class="flex flex-col gap-4">
  <p>Checking link...</p>
</div>
