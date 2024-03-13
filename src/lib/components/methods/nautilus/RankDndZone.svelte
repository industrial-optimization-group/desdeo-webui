<script>
  import { flip } from "svelte/animate";
  import { onMount } from "svelte";
  import { rankPreferences, inputRanks } from "./stores";

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

{#each $inputRanks as rank, rankIndex (rank)}
  <div animate:flip>
    <b>{rank.name}</b>
    <ul
      class:hovering={hoveringOverRank === rank.name}
      on:dragenter={() => (hoveringOverRank = rank.name)}
      on:dragleave={() => (hoveringOverRank = null)}
      on:drop={(event) => {
        drop(event, rankIndex);
        updatePreferenceInfo();
      }}
      ondragover="return false"
    >
      {#each rank.items as item, itemIndex (item)}
        <div class="item" animate:flip style="--objective-color: {item.color};">
          <li
            class="mr-2 inline-block h-8 w-8 cursor-pointer rounded bg-gray-200 p-2 text-xs font-medium text-gray-700 hover:bg-orange-500 hover:text-white"
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

<button on:click={resetRanks} class="reset-button">Reset</button>

<style>
  .hovering {
    border-color: orange;
  }
  .item {
    display: inline; /* required for flip to work */
  }

  ul {
    border: solid lightgray 1px;
    display: flex; /* required for drag & drop to work when .item display is inline */
    height: 40px; /* needed when empty */
    padding: 10px;
  }

  .reset-button {
    background-color: #d9534f; /* Red color to match the screenshot's button */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: none; /* No shadow for a flat button */
    font-size: 16px;
    margin-top: 20px; /* Space above the reset button */
  }
</style>
