<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import { clipboard } from "@skeletonlabs/skeleton";

  // prettier-ignore
  const citation_plain =
`G. Misitano, B. S. Saini, B. Afsar, B. Shavazipour and K. Miettinen,
"DESDEO: The Modular and Open Source Framework for Interactive
Multiobjective Optimization," in IEEE Access, vol. 9, pp. 148277-148295,
2021, doi: 10.1109/ACCESS.2021.3123825.`;

  // prettier-ignore
  const citation_bib =
`@ARTICLE{9591595,
  author={Misitano, G. and Saini, B. S. and Afsar, B. and Shavazipour, B. and Miettinen, K.},
  journal={IEEE Access},
  title={DESDEO: The Modular and Open Source Framework for Interactive Multiobjective Optimization},
  year={2021},
  volume={9},
  number={},
  pages={148277-148295},
  doi={10.1109/ACCESS.2021.3123825},
}`;

  // Show BibTeX by default
  let tabSet = 1;
</script>

<TabGroup>
  <Tab bind:group={tabSet} name="tab1" value={0}>Plain text</Tab>
  <Tab bind:group={tabSet} name="tab2" value={1}>BibTeX</Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      <div class="mb-4 bg-white p-2 font-mono">{citation_plain}</div>
      <button class="anchor" use:clipboard={citation_plain}
        >Copy to clipboard</button
      >
    {:else if tabSet === 1}
      <div class="mb-4 bg-white p-2">
        <pre class="whitespace-pre-wrap">{citation_bib}</pre>
      </div>
      <div class="flex gap-2">
        <button class="anchor" use:clipboard={citation_bib}
          >Copy to clipboard</button
        >
        <a class="anchor" href="TODO">Download</a>
      </div>
    {/if}
  </svelte:fragment>
</TabGroup>
