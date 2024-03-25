import { writable } from "svelte/store";

export const weightPreferences = writable([] as number[]);
export const inputWeights = writable([] as number[]);
export const rankPreferences = writable([] as number[]);
export const inputRanks = writable([] as number[]);

export const objectiveRanges = writable({
  ideal: [] as number[],
  nadir: [] as number[],
});

export const iterationDetails = writable([]);

export const inputIterations = writable({
  iterationType: "AUTO",
  iterations: 5,
});

export const distance = writable(0);

export const stepsTaken = writable(0);
