import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { logged_in } from "$lib/api";

/** @type {import("./$types").PageLoad} */
export function load() {
  if (get(logged_in)) {
    //
    // The root page currently has no content to show, so we redirect
    // logged in users to /saved_problems
    //
    throw redirect(307, "/saved_problems");
  }
}
