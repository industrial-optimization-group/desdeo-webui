<div class="flex flex-col gap-2 bg-white p-4 shadow-md {$$props.class ?? ''}">
  {#if $$slots.header || $$slots.buttons}
    <header class="mb-4 flex justify-between gap-4">
      <span class="font-bold">
        <slot name="header" />
      </span>
      <div class="flex gap-2">
        <slot name="buttons" />
      </div>
    </header>
  {/if}
  <slot />
  {#if $$slots.footer}
    <footer class="mt-4">
      <slot name="footer" />
    </footer>
  {/if}
</div>
