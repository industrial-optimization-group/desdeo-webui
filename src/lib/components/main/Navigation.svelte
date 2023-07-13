<script>
  import { setContext } from "svelte";
  import { page } from "$app/stores";
  import NavigationTile from "$lib/components/main/NavigationTile.svelte";
  import logo from "$lib/assets/logo.png";
  import PlusIcon from "~icons/heroicons/plus";
  import PuzzleIcon from "~icons/heroicons/puzzle-piece";

  //
  // Navigation tiles get the `active` and `hover` styles from the context,
  // unless they are explicitly given as props.
  //
  setContext("active", "bg-surface-500");
  setContext("hover", "hover:bg-surface-500/50");
</script>

<!--
  TODO: Use the theme system instead of hardcoded colors?
-->
<div class="h-full bg-[#141313] text-[#f0efef]">
  <div class="flex flex-col items-center">
    <NavigationTile href="/" selected={$page.url.pathname === "/"}>
      <img src={logo} alt="" />
    </NavigationTile>
    <NavigationTile
      href="/saved_problems"
      selected={$page.url.pathname === "/saved_problems"}
      text={["Saved", "problems"]}
    >
      <PuzzleIcon />
    </NavigationTile>
    <NavigationTile
      href="/new_problem"
      selected={$page.url.pathname === "/new_problem"}
      text={["New", "problem"]}
    >
      <PlusIcon />
    </NavigationTile>
  </div>
</div>
