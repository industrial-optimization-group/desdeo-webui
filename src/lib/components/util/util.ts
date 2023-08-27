/**
 * Transforms lists of lower and upper bounds to a list of bounds objects used
 * by many of the visualizations components.
 *
 * NOTE: The caller is responsible for verifying that the lists have the same
 * length.
 */
export function transform_bounds(
  lower_bounds: number[],
  upper_bounds: number[]
): { min: number; max: number }[] {
  return lower_bounds.map((lower_bound, j) => ({
    min: lower_bound,
    max: upper_bounds[j],
  }));
}
