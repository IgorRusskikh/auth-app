import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const credentials = await req.json();

  console.log(credentials);

  if (!credentials) {
    return NextResponse.json(
      { message: "Check your credentials" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Важно для передачи и сохранения токенов в куках
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(await response.json());
    }

    const cookies = response.headers.get("set-cookie") as string;

    const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
    const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);

    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

    if (accessToken && refreshToken) {
      return NextResponse.json(
        { message: "You successfully loged in" },
        {
          status: 200,
          headers: {
            "Set-Cookie": cookies,
          },
        }
      );
    }

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Server error. Try later" },
      { status: 500 }
    );
  }
};
