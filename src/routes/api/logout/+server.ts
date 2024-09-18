import { removeAuth } from "$lib/server/utils";

export const POST = async ({ cookies }) => {
  removeAuth(cookies);
  return new Response("Logged out successfully", {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
