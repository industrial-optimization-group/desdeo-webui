<script lang="ts">
  import { drawerStore } from "@skeletonlabs/skeleton";
  import NewWindowIcon from "$lib/assets/icons/NewWindow.svelte";

  export let show_bibtex_button = false;
</script>

<div>
  <p>
    The DESDEO software framework has been developed by the Multiobjective
    Optimization Group at the University of Jyväskylä. If you utilize it, we
    kindly ask you to cite

    <cite class="m-4 block">
      G.&nbsp;Misitano, B.&nbsp;S.&nbsp;Saini, B.&nbsp;Afsar,
      B.&nbsp;Shavazipour and K.&nbsp;Miettinen, "DESDEO: The Modular and Open
      Source Framework for Interactive Multiobjective Optimization", IEEE
      Access, vol.&nbsp;9, pp.&nbsp;148277&ndash;148295, 2021, doi: <a
        href="https://ieeexplore.ieee.org/document/9591595"
        target="_blank"
        ><span class="anchor inline-flex items-center gap-1"
          ><span>10.1109/ACCESS.2021.3123825</span> <NewWindowIcon /></span
        ></a
      >.
    </cite>
  </p>
  {#if show_bibtex_button}
    <div>
      <button
        class="anchor"
        on:click={() => {
          drawerStore.open();
        }}>Show BibTeX</button
      >
    </div>
  {/if}
</div>
