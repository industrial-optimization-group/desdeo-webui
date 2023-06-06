<script>
  import NavigationTile from "$lib/components/main/NavigationTile.svelte";
  import logo from "$lib/assets/logo.png";
  import problem from "$lib/assets/problem.svg";
</script>

<!--
  TODO: Use the theme system insted of hardcoded colors?
-->
<div class="h-full bg-[#141313] text-[#f0efef]">
  <div class="flex flex-col items-center">
    <NavigationTile href="/">
      <img src={logo} alt="" />
    </NavigationTile>
    <NavigationTile href="/saved_problems" text={["Saved", "problems"]}>
      <img src={problem} alt="" />
    </NavigationTile>
    <NavigationTile href="/new_problem" text={["New", "problem"]}>
      <img src={problem} alt="" />
    </NavigationTile>
  </div>
</div>
