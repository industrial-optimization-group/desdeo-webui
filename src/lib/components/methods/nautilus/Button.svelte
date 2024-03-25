<script>
  export let mode = "neutral"; // Default mode is neutral
  export let disabled = false;
  export let text;

  // Function to determine the button color based on the mode
  function determineColor(mode) {
    switch (mode) {
      case "delete":
      case "reset":
        return "red";
      case "neutral":
      default:
        return "blue";
    }
  }

  // Compute the color based on the mode
  $: color = determineColor(mode);
</script>

<button
  on:click
  {disabled}
  style="background-color: {color}; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
>
  {text}
</button>

<style>
  button:hover:not(:disabled) {
    opacity: 0.8;
  }

  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
