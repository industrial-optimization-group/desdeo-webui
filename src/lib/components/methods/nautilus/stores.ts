import { writable } from "svelte/store";

export const iterationDetails = writable([]);

export const inputIterations = writable({
  iterationType: "AUTO",
  iterations: 5,
});

export const stepsTaken = writable(0);
