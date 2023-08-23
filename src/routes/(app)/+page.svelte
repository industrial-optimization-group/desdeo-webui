<script lang="ts">
  import { login_status, LoginStatus } from "$lib/api";
  import { goto } from "$app/navigation";

  if ($login_status !== LoginStatus.LoggedOut) {
    //
    // The root page currently has no content to show, so we redirect
    // logged in users to /saved_problems
    //
    goto("/saved_problems");
  }
</script>

<h1>Root page</h1>
