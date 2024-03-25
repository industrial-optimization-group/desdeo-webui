<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PreferenceType } from "./types";

  // Define a local variable for the selected preference
  let selectedPreference: PreferenceType = PreferenceType.RANK;

  // Enum to define preference types

  // Event dispatcher for when the preference changes
  const dispatch = createEventDispatcher();

  // Function to set the preference and dispatch an event
  function setPreference(preference: PreferenceType) {
    selectedPreference = preference;
    dispatch("preferenceChange", { selectedPreference });
  }
</script>

<div class="mb-3 mt-3 flex">
  <label class="mr-10">
    <input
      type="radio"
      bind:group={selectedPreference}
      value={PreferenceType.WEIGHT}
      on:change={() => setPreference(PreferenceType.WEIGHT)}
    />
    <span />
    Weight
  </label>
  <label>
    <input
      type="radio"
      bind:group={selectedPreference}
      value={PreferenceType.RANK}
      on:change={() => setPreference(PreferenceType.RANK)}
      checked
    />
    <span />
    Rank
  </label>
</div>
