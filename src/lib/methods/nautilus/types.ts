export type ObjectiveData = {
  name: string;
  minimize: boolean;
  value?: number;
};

export type IterationData = {
  current_iteration_point: number[];
  distance: number[];
  nadir_point: number[];
  ideal_point: number[];
  lower_bounds: number[];
  upper_bounds: number[];
  iteration_counter: number;
};
