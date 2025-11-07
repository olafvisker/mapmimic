export interface ElevationAnalysis {
  min: number;
  max: number;
  mean: number;
  std: number;
  range: number;
  sortedElevations: number[];
  bins: number[];
}
