<script lang="ts" context="module">
  const operators = [
    "Equal",
    "Greater",
    "GreaterEqual",
    "Less",
    "LessEqual",
  ] as const;

  export type Operator = (typeof operators)[number];
</script>

<script lang="ts">
  import Card from "../main/Card.svelte";
  import IdentifierInput from "./IdentifierInput.svelte";
  import MathInput from "./MathInput.svelte";
  import DescriptionInput from "./DescriptionInput.svelte";
  import { match } from "ts-pattern";

  export let name = "";
  export let value: unknown;
  export let description = "";

  let operator = "GreaterEqual";
  let left = "";
  let right = "";

  function display(operator: Operator): string {
    return match(operator)
      .with("Equal", () => "=")
      .with("Greater", () => ">")
      .with("GreaterEqual", () => "≥")
      .with("Less", () => "<")
      .with("LessEqual", () => "≤")
      .exhaustive();
  }

  $: try {
    value = [operator, JSON.parse(left), JSON.parse(right)];
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
  <MathInput bind:math_json={left} />
  <div class="flex items-center gap-2">
    <select class="select w-20" value={operator}>
      {#each operators as operator}
        <option value={operator}>{display(operator)}</option>
      {/each}
    </select>
  </div>
  <MathInput bind:math_json={right} />
  <IdentifierInput bind:name />
  <DescriptionInput bind:description />
</Card>
