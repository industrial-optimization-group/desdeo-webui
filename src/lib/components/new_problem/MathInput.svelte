<script lang="ts">
  //
  // It seems we need to import this module to get the value of the MathLive
  // component in the MathJSON format.
  //
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import * as compute_engine from "@cortex-js/compute-engine";

  //
  // TODO: According to the documentation we should be able to set the compute
  // engine instance used by the MathLive component, but I didn't get this to
  // work. Instead a default instance seems to be used as long as the compute
  // engine module has been imported.
  //

  import { MathfieldElement } from "mathlive";
  import { onMount } from "svelte";

  /**
   * The value of the input as a LaTeX expression.
   *
   * NOTE: This property is for output only. It's value is ignored by the
   * component.
   *
   * TODO: Make it possible to use this property for setting the value.
   */
  export let latex = "";

  /**
   * The value of the input as a stringified MathJSON expression.
   *
   * NOTE: This property is for output only. It's value is ignored by the
   * component.
   *
   * NOTE: The value is not guaranteed to be valid JSON at all times.
   */
  export let math_json = "";

  //
  // TODO: Can the audio features be disabled? Currently missing audio files
  // cause errors to show in the console.
  //
  const math_field = new MathfieldElement();

  ["block"].forEach((name) => {
    math_field.classList.add(name);
  });

  const root_id = crypto.randomUUID();
  onMount(() => {
    document.getElementById(root_id)?.appendChild(math_field);
    math_field.addEventListener("input", () => {
      latex = math_field.value;
      math_json = math_field.getValue("math-json");
    });
  });
</script>

<div id={root_id} class="input p-1" />
