import axios from "axios";
import { username as username_store } from "$lib/stores.js";

import {
  get_access_token,
  set_access_token,
  reset_access_token,
  get_refresh_token,
  set_refresh_token,
  reset_refresh_token,
} from "$lib/tokens.js";

const baseURL = "http://localhost:5000";

function instance() {
  return axios.create({ baseURL });
}

function with_access_token() {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${get_access_token()}`,
    },
  });
}

// TODO: Authorization error should also invalidate the access token
// if it exists?
function with_refresh_token() {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${get_refresh_token()}`,
    },
  });
}

// Overwrites current tokens without invalidating them.
// The caller is responsible for invalidating old tokens
// with the logout function.
export function login(username: string, password: string) {
  return instance()
    .post("/login", {
      username,
      password,
    })
    .then((response) => {
      set_access_token(response.data.access_token);
      set_refresh_token(response.data.refresh_token);
      // Ideally the backend would return the username,
      // but we'll use the submitted username as a replacement
      username_store.set(username);
      return {
        message: response.data.message,
      };
    });
}

export function invalidate_access_token() {
  return with_access_token()
    .post("/logout/access")
    .then(() => {
      reset_access_token();
      return Promise.resolve();
    });
}

function invalidate_refresh_token() {
  return with_refresh_token()
    .post("/logout/refresh")
    .then(() => {
      reset_refresh_token();
      return Promise.resolve();
    });
}

export function refresh_access_token() {
  return with_refresh_token()
    .post("/token/refresh")
    .then((response) => {
      set_access_token(response.data.access_token);
      return Promise.resolve();
    });
}

export function logout() {
  return invalidate_refresh_token().then(() => {
    return invalidate_access_token();
  });
}
