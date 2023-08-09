import { get_all_problems } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  return {
    desdeo_problems: await get_all_problems(),
  };
};
