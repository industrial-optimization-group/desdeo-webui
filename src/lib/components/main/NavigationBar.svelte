<script>
  import NavigationButton from "$lib/components/main/NavigationButton.svelte";
  import logo from "$lib/assets/logo.png";
  import start from "$lib/assets/start.svg";
  import problem from "$lib/assets/problem.svg";
</script>

<div id="container">
  <div id="layout">
    <img src={logo} alt="" />
    <NavigationButton href="/" image={start} text={["Start"]} />
    <NavigationButton
      href="/create_problem"
      image={problem}
      text={["Create", "a problem"]}
    />
  </div>
</div>

<style>
  #container {
    height: 100%;
    background-color: #141313;
    color: #f0efef;
  }

  #layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5em;
    padding: 0.5em;
  }

  img {
    margin: 1em;
  }
</style>
