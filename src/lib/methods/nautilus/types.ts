export type ObjectiveData = {
  name: string;
  minimize: boolean;
  value?: number;
};

export type IterationData = {
  currentIterationPoint: number[];
  distance: number[];
  nadirPoint: number[];
  idealPoint: number[];
  lowerBounds: number[];
  upperBounds: number[];
  iterationCounter: number;
};
