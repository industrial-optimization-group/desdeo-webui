import axios from "axios";
import { baseURL } from "$lib/api";
import { setRefreshTokenCookie } from "$lib/server/utils";

export const POST = async ({ cookies }) => {
  if (!cookies.get("refreshToken")) {
    return new Response("No refresh token", {
      status: 302,
    });
  }

  const response = await axios({
    baseURL: baseURL,
    url: "refresh",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: {
      code: cookies.get("refreshToken"),
    },
  });

  if (response.status === 200) {
    const data = response.data;

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
