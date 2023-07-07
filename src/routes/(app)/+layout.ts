import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { login_status, LoginStatus } from "$lib/api";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = () => {
  if (get(login_status) === LoginStatus.LoggedOut) {
    throw redirect(307, "/login");
  }
};
