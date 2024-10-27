import NextAuth, { User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { getSessionData, refreshTokens } from "./actions/auth.action";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials): Promise<User | null> => {
        try {
          const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const user = await getSessionData(response);

            return user;
          }
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 15,
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log(user);

      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name;
      }

      if (token.exp && token.exp < Math.floor(Date.now() / 1000)) {
        const tokens = await refreshTokens(token);

        console.log(tokens);

        if (tokens) {
          return {
            ...token,
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken,
          };
        }
      }

      return {
        ...token,
      };
    },
    async session({ session, token }: { token: JWT }) {
      session.user = {
        id: token?.id,
        name: token.name,
      };

      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },
});
