<script lang="ts">
  import { onDestroy } from "svelte";
  export let title = "";
  export let dismissByClick = false; // New prop
  let isHovered = false;
  let x: number;
  let y: number;
  let tooltipElement: HTMLElement | null = null;

  function mouseOver(event: MouseEvent) {
    isHovered = true;
    updatePosition(event);
  }

  function mouseMove(event: MouseEvent) {
    if (!dismissByClick) {
      updatePosition(event);
    }
  }

  function mouseLeave() {
    if (!dismissByClick) {
      isHovered = false;
    }
  }

  function updatePosition(event: MouseEvent) {
    x = event.pageX + 5;
    y = event.pageY + 5;
  }

  // Handle clicks outside the tooltip
  function handleClickOutside(event: MouseEvent) {
    if (
      tooltipElement &&
      !tooltipElement.contains(event.target as Node) &&
      isHovered
    ) {
      isHovered = false;
    }
  }

  if (dismissByClick) {
    // Add click listener when component mounts if dismissByClick is true
    window.addEventListener("click", handleClickOutside);
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (dismissByClick) {
      window.removeEventListener("click", handleClickOutside);
    }
  });
</script>

<div
  role="button"
  tabindex="0"
  on:mouseover={mouseOver}
  on:focus={() => (isHovered = true)}
  on:mouseleave={mouseLeave}
  on:blur={mouseLeave}
  on:mousemove={mouseMove}
>
  <slot />
</div>

{#if isHovered}
  <div
    bind:this={tooltipElement}
    style="top: {y}px; left: {x}px;"
    class="tooltip"
  >
    {title}
  </div>
{/if}

<style>
  .tooltip {
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    background: white;
    border-radius: 4px;
    padding: 4px;
    position: absolute;
    z-index: 100;
  }
</style>
