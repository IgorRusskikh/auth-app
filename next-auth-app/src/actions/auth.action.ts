import { User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { cookies as nextCookies } from "next/headers";

export async function getCookieTokens(response: Response) {
  const responseCookies = response.headers.get("set-cookie") as string;

  const accessTokenMatch = responseCookies.match(/accessToken=([^;]+)/);
  const refreshTokenMatch = responseCookies.match(/refreshToken=([^;]+)/);

  const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
  const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

  return { accessToken, refreshToken };
}

export const getSessionData = async (
  response: Response
): Promise<User | null> => {
  const { accessToken, refreshToken } = await getCookieTokens(response);

  if (accessToken && refreshToken) {
    const cookies = await nextCookies();

    cookies.set("accessToken", accessToken as string, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 15,
    });

    cookies.set("refreshToken", refreshToken as string, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    const userData = await response.json();

    const user: User = {
      id: userData.id,
      name: userData.username,
      accessToken,
      refreshToken,
    };

    return user;
  }

  return null;
};

export const refreshTokens = async (
  token: JWT
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const response = await fetch("http://localhost:3000/auth/refresh-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: token.username,
        refreshToken: token.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh tokens:", response.statusText);
      return null;
    }

    console.log("await response.json()", await response.json());

    const { accessToken, refreshToken } = await getCookieTokens(response);

    if (accessToken && refreshToken) {
      const cookies = await nextCookies();

      cookies.set("accessToken", accessToken as string, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 15,
      });

      cookies.set("refreshToken", refreshToken as string, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });

      return {
        ...token,
        accessToken,
        refreshToken,
      };
    }

    return null;
  } catch (err) {
    console.error("Error refreshing tokens:", err);
    return null;
  }
};
