<script lang="ts">
  import Card from "../main/Card.svelte";
  import IdentifierInput from "./IdentifierInput.svelte";
  import { kinds, type Kind } from "./NewProblem.svelte";

  export let name: string;
  export let kind: Kind;
  export let description: string;
</script>

<Card>
  <div class="flex flex-col gap-2">
    <IdentifierInput bind:name />
    <div class="flex flex-wrap gap-2">
      {#each kinds as { value, display }}
        <label class="flex items-center gap-1">
          <input type="radio" class="radio" {value} bind:group={kind} />
          <span>{display}</span>
        </label>
      {/each}
    </div>
    <textarea
      class="textarea"
      rows="1"
      bind:value={description}
      placeholder="Description*"
    />
  </div>
</Card>
