<script lang="ts">
  import Card from "../main/Card.svelte";
  import IdentifierInput from "./IdentifierInput.svelte";
  import MathInput from "./MathInput.svelte";
  import DescriptionInput from "./DescriptionInput.svelte";

  export let name = "";
  export let value: unknown;
  export let description = "";

  let math_json = "";

  $: try {
    value = JSON.parse(math_json);
    //
  } catch (err) {
    //
    // The `MathInput` component doesn't guarantee the validity of the JSON
    // at all times, so we ignore syntax errors and rethrow everything else.
    //
    if (!(err instanceof SyntaxError)) {
      throw err;
    }
  }
</script>

<Card>
  <IdentifierInput bind:name />
  <div class="flex items-center gap-2">
    <span>=</span>
    <MathInput bind:math_json />
  </div>
  <DescriptionInput bind:description />
</Card>
