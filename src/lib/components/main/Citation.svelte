<script lang="ts">
  import { drawerStore } from "@skeletonlabs/skeleton";
  import NewWindowIcon from "$lib/assets/icons/NewWindow.svelte";

  function handleClick() {
    drawerStore.open();
  }

  export let show_bibtex_button = false;
</script>

<div>
  <p>
    The DESDEO software framework has been developed by the Multiobjective
    Optimization Group at the University of Jyväskylä. If you utilize it, we
    kindly ask you to cite

    <cite class="m-4 block">
      G. Misitano, B. S. Saini, B. Afsar, B. Shavazipour and K. Miettinen,
      "DESDEO: The Modular and Open Source Framework for Interactive
      Multiobjective Optimization," in IEEE Access, vol. 9, pp. 148277-148295,
      2021, doi: 10.1109/ACCESS.2021.3123825.
    </cite>
  </p>
  <div class="flex gap-2">
    <a
      class="anchor"
      href="https://ieeexplore.ieee.org/document/9591595"
      target="_blank"
    >
      <div class="flex items-center gap-1">
        <NewWindowIcon />
        <span>Open access</span>
      </div>
    </a>
    {#if show_bibtex_button}
      <button class="anchor" on:click={handleClick}>Show BibTeX</button>
    {/if}
  </div>
</div>
