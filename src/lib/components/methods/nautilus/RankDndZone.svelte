<script>
  import { flip } from "svelte/animate";
  import { onMount } from "svelte";
  import { rankPreferences, inputRanks } from "./stores";
  import Button from "./Button.svelte";

  export let objectives;
  export let ranks;

  let hoveringOverRank;

  onMount(() => {
    updatePreferenceInfo();
  });

  function dragStart(event, rankIndex, objectiveIndex) {
    const data = { rankIndex, objectiveIndex };
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  }

  function drop(event, rankIndex) {
    event.preventDefault();
    const json = event.dataTransfer.getData("text/plain");
    const data = JSON.parse(json);
    const item = ranks[data.rankIndex].items[data.objectiveIndex];

    ranks[data.rankIndex].items.splice(data.objectiveIndex, 1);
    ranks[rankIndex].items.push(item);
    ranks = [...ranks];

    inputRanks.set(ranks);
    hoveringOverRank = null;
  }
  function updatePreferenceInfo() {
    let preferenceInfo = $rankPreferences;
    ranks.forEach((rank, rankIndex) => {
      if (rankIndex === 0) return;
      rank.items.forEach((item) => {
        const objectiveIndex = objectives.findIndex(
          (obj) => obj.id === item.id
        );
        preferenceInfo[objectiveIndex] = rankIndex;
      });
    });
    rankPreferences.set(preferenceInfo);
    inputRanks.set(ranks);
  }

  function resetRanks() {
    ranks.forEach((rank, index) => {
      if (index > 0) {
        rank.items = [];
      }
    });

    ranks[0].items = objectives.map((obj) => ({
      name: obj.name,
      minimize: obj.minimize,
      color: obj.color,
      id: obj.id,
    }));

    ranks = [...ranks];
    inputRanks.set(ranks);
    updatePreferenceInfo();
  }
</script>

<div class="mb-4">
  {#each $inputRanks as rank, rankIndex (rank)}
    <div animate:flip>
      <ul
        class="{rankIndex === 0 ? 'first-container' : ''} {hoveringOverRank ===
        rank.name
          ? 'hovering'
          : ''}"
        on:dragenter={() => (hoveringOverRank = rank.name)}
        on:dragleave={() => (hoveringOverRank = null)}
        on:drop={(event) => {
          drop(event, rankIndex);
          updatePreferenceInfo();
        }}
        ondragover="return false"
      >
        {#if rank.items.length === 0}
          <div class="rank-placeholder">{rank.name}</div>
        {/if}
        {#each rank.items as item, itemIndex (item)}
          <div
            class="item"
            animate:flip
            style="--objective-color: {item.color};"
          >
            <li
              class="mb-2 mr-2 inline-block h-10 w-10 cursor-pointer rounded bg-gray-200 p-2 text-xs font-medium text-gray-700 hover:text-white"
              draggable="true"
              on:dragstart={(event) => dragStart(event, rankIndex, itemIndex)}
              style="background-color: {item.color};"
            >
              {item.name.substr(0, 6)}
            </li>
          </div>
        {/each}
      </ul>
    </div>
  {/each}
  <div class="mt-2 flex justify-end">
    <Button on:click={resetRanks} mode="reset" text={"Reset"} />
  </div>
</div>

<style>
  .rank-placeholder {
    padding: 5px;
    color: #afafaf; /* Light grey color for the placeholder */
  }
  .hovering {
    border-color: orange;
  }
  .item {
    display: inline; /* required for flip to work */
  }
  .first-container {
    border-color: transparent; /* Or use 'none' if you want to remove the border */
  }

  ul {
    border: solid lightgray 1px;
    display: flex; /* required for drag & drop to work when .item display is inline */
    height: 50px; /* needed when empty */
    padding: 5px;
    margin-bottom: 5px;
  }
</style>
