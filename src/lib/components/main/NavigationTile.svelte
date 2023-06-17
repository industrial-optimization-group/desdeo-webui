<script lang="ts">
  import { getContext } from "svelte";

  export let text: string[] = [];
  export let selected = false;
  export let active: string = getContext("active");
  export let hover: string = getContext("hover");

  $: classesActive = selected ? active : "";
  $: classesHover = !selected ? hover : "";
</script>

<a
  href={$$props.href}
  class="min-h-[content-width] w-full px-2 py-6 {classesActive} {classesHover}"
>
  <div class="flex flex-col items-center gap-2">
    <slot />
    <div class="flex flex-col items-center">
      {#each text as row}
        <span class="whitespace-nowrap">{row}</span>
      {/each}
    </div>
  </div>
</a>
