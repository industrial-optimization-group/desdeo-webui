<script lang="ts">
  import ParallelAxis from "$lib/components/visual/ParallelAxis.svelte";

  let data = [
    [12.99, 100, 82, "Good"],
    [9.99, 80, 77, "OK"],
    [20, 120, 60, "Excellent"],
    [22, 125, 20, "Excellent"],
  ];
  let title = "test Title";
</script>

<div>
  <ParallelAxis {title} {data} />
</div>
