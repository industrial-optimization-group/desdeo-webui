<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import ClipboardButton from "./ClipboardButton.svelte";

  // prettier-ignore
  const citation_plain =
`G. Misitano, B. S. Saini, B. Afsar, B. Shavazipour and K. Miettinen,
"DESDEO: The Modular and Open Source Framework for Interactive
Multiobjective Optimization", IEEE Access, vol. 9, pp. 148277–148295,
2021, doi: 10.1109/ACCESS.2021.3123825.`;

  // prettier-ignore
  const citation_bib =
`@ARTICLE{9591595,
  author={Misitano, G. and Saini, B. S. and Afsar, B. and Shavazipour, B. and Miettinen, K.},
  title={DESDEO: The Modular and Open Source Framework for Interactive Multiobjective Optimization},
  journal={IEEE Access},
  volume={9},
  pages={148277--148295},
  year={2021},
  doi={10.1109/ACCESS.2021.3123825},
}`;

  // Show BibTeX by default
  let tabSet = 0;
</script>

<TabGroup>
  <Tab bind:group={tabSet} name="tab1" value={0}>BibTeX</Tab>
  <Tab bind:group={tabSet} name="tab2" value={1}>Plain text</Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      <div class="mb-4 bg-white p-2">
        <pre class="whitespace-pre-wrap">{citation_bib}</pre>
      </div>
      <div class="flex gap-2">
        <ClipboardButton content={citation_bib} />
        <a class="anchor" href="TODO">Download</a>
      </div>
    {:else if tabSet === 1}
      <div class="mb-4 bg-white p-2 font-mono">{citation_plain}</div>
      <ClipboardButton content={citation_plain} />
    {/if}
  </svelte:fragment>
</TabGroup>
