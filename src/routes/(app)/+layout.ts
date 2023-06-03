import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { logged_in } from "$lib/api";

/** @type {import("./$types").LayoutLoad} */
export function load() {
  if (!get(logged_in)) {
    throw redirect(307, "/login");
  }
}
