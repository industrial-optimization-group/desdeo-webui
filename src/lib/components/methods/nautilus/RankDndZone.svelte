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

    console.log(data);

    // Ensure you're accessing the correct item
    const item = ranks[data.rankIndex].items[data.objectiveIndex];

    // Remove the item from its original place
    ranks[data.rankIndex].items.splice(data.objectiveIndex, 1);

    // Add the item to the new place
    ranks[rankIndex].items.push(item);

    // Trigger Svelte's reactivity by re-assigning the array
    ranks = [...ranks];

    inputRanks.set(ranks);

    hoveringOverRank = null;
  }
  function updatePreferenceInfo() {
    // Reset preferenceInfo with zeros, assuming the length is equal to the objectives count.
    let preferenceInfo = $rankPreferences;

    // Iterate over ranks to assign new ranks based on current positions
    ranks.forEach((rank, rankIndex) => {
      // Skip the first entry as it's not a rank but the header/"Objectives" placeholder
      if (rankIndex === 0) return;

      rank.items.forEach((item) => {
        // Find the index of the item in the original objectives array to map the rank correctly
        const objectiveIndex = objectives.findIndex(
          (obj) => obj.id === item.id
        );
        preferenceInfo[objectiveIndex] = rankIndex;
      });
    });
    rankPreferences.set(preferenceInfo);
    inputRanks.set(ranks);
    console.log($inputRanks);
  }
  function resetRanks() {}
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
            draggable={true}
            on:dragstart={(event) => dragStart(event, rankIndex, itemIndex)}
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
  li {
    background-color: lightgray;
    cursor: pointer;
    display: inline-block;
    margin-right: 10px;
    padding: 10px;
    height: 30px;
    width: 30px;
    font-size: 12px;
  }
  li:hover {
    background: orange;
    color: white;
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
