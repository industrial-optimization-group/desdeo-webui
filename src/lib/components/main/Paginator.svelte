<script lang="ts">
  export let total_items: number;
  export let items_per_page: 10;

  const min_page_number = 0;
  const max_page_number = Math.ceil(total_items / items_per_page) - 1;
  export let page_number = min_page_number;

  // First item of the current page
  export let start = page_number * items_per_page;
  // First item of the next page
  export let endExclusive = start + items_per_page;
  // Last item of the current page
  export let endInclusive = endExclusive - 1;

  $: {
    start = page_number * items_per_page;
    endExclusive = start + items_per_page;
    endInclusive = endExclusive - 1;
  }

  function handlePrev() {
    if (page_number > min_page_number) {
      page_number--;
    }
  }

  function handleNext() {
    if (page_number < max_page_number) {
      page_number++;
    }
  }
</script>

<div class="flex gap-1 py-1">
  <button
    class="anchor"
    on:click={handlePrev}
    disabled={!(page_number > min_page_number)}>Prev</button
  >
  <button
    class="anchor"
    on:click={handleNext}
    disabled={!(page_number < max_page_number)}>Next</button
  >
</div>
