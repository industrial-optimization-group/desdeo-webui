import type { Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  sub: string;
  exp: number;
}

export function setRefreshTokenCookie(
  cookies: Cookies,
  refreshToken: string
): void {
  const { exp } = jwt.decode(refreshToken) as JwtPayload;
  cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none",
    expires: new Date(exp * 1000),
  });
}

export function removeAuth(cookies: Cookies): void {
  cookies.delete("refreshToken", { path: "/" });
}
