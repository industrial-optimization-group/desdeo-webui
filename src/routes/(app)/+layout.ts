import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { login_status, LoginStatus } from "$lib/api";

/** @type {import("./$types").LayoutLoad} */
export function load() {
  if (get(login_status) === LoginStatus.LoggedOut) {
    throw redirect(307, "/login");
  }
}
