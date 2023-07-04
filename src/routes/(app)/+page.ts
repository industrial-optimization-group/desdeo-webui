import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { login_status, LoginStatus } from "$lib/api";

/** @type {import("./$types").PageLoad} */
export function load() {
  if (get(login_status) !== LoginStatus.LoggedOut) {
    //
    // The root page currently has no content to show, so we redirect
    // logged in users to /saved_problems
    //
    throw redirect(307, "/saved_problems");
  }
}
