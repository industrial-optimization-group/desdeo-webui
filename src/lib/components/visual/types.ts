export type SolutionData = {
  names: string[];
  values: number[][];
  value_ranges: number[][];
  tags: string[][];
  uncertainty: number[][][];
  minimize: boolean[];
};

export type Ranges = {
  min: number;
  max: number;
};
