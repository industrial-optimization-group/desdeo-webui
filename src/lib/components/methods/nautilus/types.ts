import { writable } from "svelte/store";

export enum PreferenceType {
  WEIGHT = "Weight",
  RANK = "Rank",
}

export enum IterationsType {
  AUTO = "Automatic",
  MANUAL = "Manual",
}

export enum AppState {
  IDLE = "IDLE",
  WORKING = "WORKING",
}

export type NautilusObjectiveData = {
  name: string;
  minimize: boolean;
  value: number;
  color: string;
  id: string;
};

export type Iteration = {
  currentIterationPoint: number[];
  distance: number[];
  lowerBounds: number[];
  upperBounds: number[];
};

export type NautilusRanks = {
  name: string;
  items: NautilusObjectiveData[];
}[];

type FinalSolutionData = {
  currentIterationPoint: number[];
  lowerBounds: number[];
  upperBounds: number[];
  distance: number[];
};

export const finalSolution = writable<FinalSolutionData>({
  currentIterationPoint: [],
  lowerBounds: [],
  upperBounds: [],
  distance: [],
});
