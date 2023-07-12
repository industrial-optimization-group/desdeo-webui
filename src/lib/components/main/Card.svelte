<div class="flex flex-col gap-2 bg-white p-4 shadow-md">
  {#if $$slots.header}
    <header class="mb-4 text-lg font-bold">
      <slot name="header" />
    </header>
  {/if}
  <slot />
  {#if $$slots.footer}
    <footer class="mt-4">
      <slot name="footer" />
    </footer>
  {/if}
</div>
