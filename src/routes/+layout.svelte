<script>
  import NavigationBar from "$lib/components/main/NavigationBar.svelte";
</script>

<div id="layout">
  <nav>
    <NavigationBar />
  </nav>
  <header>Top bar</header>
  <main>
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    background-color: #f0efef;
  }

  #layout {
    display: grid;
    grid-template-areas:
      "a b"
      "a c";
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;

    height: 100vh;
  }

  nav {
    grid-area: a;
  }

  header {
    grid-area: b;
  }

  main {
    grid-area: c;

    padding: 10px;
  }
</style>
