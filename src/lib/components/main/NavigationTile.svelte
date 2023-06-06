<script lang="ts">
  export let text: string[] = [];
</script>

<a href={$$props.href} class="min-h-[content-width] w-full px-2 py-6">
  <div class="flex flex-col items-center gap-2">
    <slot />
    <div class="flex flex-col items-center">
      {#each text as row}
        <span class="whitespace-nowrap">{row}</span>
      {/each}
    </div>
  </div>
</a>
