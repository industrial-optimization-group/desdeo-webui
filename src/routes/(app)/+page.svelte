<script lang="ts">
  import { baseURL, get_access_token } from "$lib/api";

  async function fetchUserDetails() {
    try {
      const res = await fetch(`${baseURL}/test/userdetails`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + get_access_token(),
        },
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  fetchUserDetails();
</script>

<div class="flex flex-col gap-4">
  <h1 class="font-bold">Welcome to DESDEO</h1>
  <p class="max-w-prose">
    You are now logged in to DESDEO. You can now solve multi-objective
    optimization problems using the DESDEO framework.
  </p>
</div>
