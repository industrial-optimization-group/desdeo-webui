<script lang="ts">
  export let mode = "neutral"; // Default mode is neutral
  export let disabled = false;
  export let text: string;

  // Function to determine the button color classes based on the mode
  function determineColorClasses(mode: string) {
    switch (mode) {
      case "delete":
      case "reset":
        return "bg-red-500 hover:bg-red-600 text-sm font-medium";
      case "neutral":
      default:
        return "bg-blue-500 hover:bg-blue-600 text-sm font-medium";
    }
  }

  // Compute the color classes based on the mode
  $: colorClasses = determineColorClasses(mode);
</script>

<button
  on:click
  {disabled}
  class={`cursor-pointer rounded-md border-none px-5 py-2.5 text-white ${
    disabled ? "cursor-not-allowed opacity-50" : "opacity-100"
  } ${colorClasses}`}
>
  {text}
</button>
