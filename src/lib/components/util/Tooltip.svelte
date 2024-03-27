<script>
  import { onDestroy } from "svelte";
  export let title = "";
  export let dismissByClick = false; // New prop
  let isHovered = false;
  let x;
  let y;
  let tooltipElement; // To reference the tooltip element

  function mouseOver(event) {
    isHovered = true;
    updatePosition(event);
  }

  function mouseMove(event) {
    if (!dismissByClick) {
      updatePosition(event);
    }
  }

  function mouseLeave() {
    if (!dismissByClick) {
      isHovered = false;
    }
  }

  function updatePosition(event) {
    x = event.pageX + 5;
    y = event.pageY + 5;
  }

  // Handle clicks outside the tooltip
  function handleClickOutside(event) {
    if (tooltipElement && !tooltipElement.contains(event.target) && isHovered) {
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
  on:mouseover={mouseOver}
  on:mouseleave={mouseLeave}
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
