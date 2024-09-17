import { setRefreshTokenCookie } from "$lib/server/utils";
import axios from "axios";
import { baseURL } from "$lib/api";

export const POST = async ({ request, cookies }) => {
  const data = await request.formData();

  const response = await axios({
    baseURL: baseURL,
    url: "token",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: {
      username: data.get("username"),
      password: data.get("password"),
      grant_type: "password",
    },
  });

  if (response.status === 200) {
    const data = response.data;
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data.access_token}`;
    if (data.refresh_token) {
      setRefreshTokenCookie(cookies, data.refresh_token);
    }

    return new Response(JSON.stringify({ access_token: data.access_token }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
