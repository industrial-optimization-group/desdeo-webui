<script lang="ts">
  export let href: string;
  export let image: string;
  export let text: string[];
</script>

<a {href}>
  <div id="container">
    <img src={image} alt="" />
    <div id="text">
      {#each text as row}
        <span>{row}</span>
      {/each}
    </div>
  </div>
</a>

<style>
  #container,
  #text {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #container {
    gap: 0.5em;
  }

  a {
    color: #f0efef;
    text-decoration-line: none;
  }
</style>
