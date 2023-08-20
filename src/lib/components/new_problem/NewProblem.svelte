<script lang="ts" context="module">
  export type Problem = {
    variables: Variable[];
    objectives: Definition[];
    constraints: Definition[];
    constants: Definition[];
  };

  export type Variable = {
    _id: string;
    name: string;
    kind: Kind;
    description: string;
  };

  export const kinds = [
    {
      value: "continuous",
      display: "Continuous",
    },
    {
      value: "discrete",
      display: "Discrete",
    },
    {
      value: "binary",
      display: "Binary",
    },
  ] as const;

  const values = kinds.map(({ value }) => value);
  export type Kind = (typeof values)[number];

  export type Definition = {
    _id: string;
    name: string;

    //
    // The value is supposed to be a MathJSON expression as given by the
    // `MathLive` component and parsed with `JSON.parse()`.
    //
    value: unknown;

    description: string;
  };

  export function new_problem(): Problem {
    return {
      variables: [],
      objectives: [],
      constraints: [],
      constants: [],
    };
  }
</script>

<script lang="ts">
  import DownloadIcon from "~icons/material-symbols/download-sharp";
  import Variables from "./Variables.svelte";
  import Objectives from "./Objectives.svelte";
  import Constraints from "./Constraints.svelte";
  import Constants from "./Constants.svelte";

  //
  // NOTE: This library is not really needed; I just used it to save some
  // time before a deadline.
  //
  // See https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
  // for how to save to file without the library.
  //
  import { saveAs } from "file-saver";

  function save_to_file(problem: Problem) {
    saveAs(
      new Blob(
        [
          JSON.stringify(
            problem,
            //
            // The `_id` fields are used for implementation purposes and are not
            // part of the problem format, so we drop them.
            //
            (key, value) => (key === "_id" ? undefined : value),
            2
          ),
        ],
        { type: "application/json" }
      )
    );
  }

  let problem = new_problem();
  let show_help = false;
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <div class="font-bold">Enter a new problem</div>

    <div class="max-w-prose">
      This interface can be used to enter a new multiobjective optimization
      problem and download it in a JSON format understood by the
      <a
        class="anchor"
        href="https://github.com/industrial-optimization-group/desdeo-problem"
        target="_blank">desdeo-problem</a
      > library.
    </div>

    <div class="max-w-prose">
      Note that this interface can't fully validate the entered data. You'll
      need to follow the instructions to make sure that
      <a
        class="anchor"
        href="https://github.com/industrial-optimization-group/desdeo-problem"
        target="_blank">desdeo-problem</a
      > will accept the problem.
    </div>

    <div class="max-w-prose">
      General instructions: <button
        class="border border-black px-1"
        on:click={() => {
          show_help = !show_help;
        }}>?</button
      >
      {#if show_help}
        <ul class="ml-8 list-disc">
          <li>You need to enter at least one variable and one objective.</li>
          <li>
            Each item requires a name that will be used to represent the item in
            formulas. You may not use the same name twice.
          </li>
          <li>Each item can also be given an optional longer description.</li>
          <li>
            The fields with a white background are
            <a
              class="anchor"
              href="https://cortexjs.io/mathlive/"
              target="_blank">MathLive</a
            >
            components that can be used to enter mathematical expressions. You need
            to enter an expression that can be evaluated to a number.
          </li>
        </ul>
      {/if}
    </div>
  </div>

  <div class="flex gap-4">
    <button
      class="btn variant-filled-primary"
      on:click={() => save_to_file(problem)}
    >
      <span><DownloadIcon /></span>
      <span>Save to file</span>
    </button>
    <button
      class="anchor"
      on:click={() => {
        problem = new_problem();
      }}>Clear all</button
    >
  </div>

  <div class="flex gap-10">
    <Variables bind:variables={problem.variables} />
    <Objectives bind:objectives={problem.objectives} />
    <Constraints bind:constraints={problem.constraints} />
    <Constants bind:constants={problem.constants} />
  </div>
</div>
