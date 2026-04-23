import { decodeJWT } from "@/utils/utils";
import { Awaitable, NextAuthOptions, RequestInternal, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // your custom login page
    signOut: "/logout", // optional, custom sign-out page
    error: "/login", // redirect errors to your login page
    verifyRequest: "/verify", // (email provider only)
    newUser: "/onboarding", // (optional) redirect new users
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Authorize called with credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          // For development: ignore self-signed certificate errors
          const fetchOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Email: credentials.email,
              Password: credentials.password,
            }),
          };

          // In development, accept self-signed certificates
          if (process.env.NODE_ENV == "development") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`,
            fetchOptions,
          );

          // Restore Security settings
          if (process.env.NODE_ENV == "development") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
          }
          const loginResponse = await res.json();
          const status = loginResponse.Status ?? loginResponse.status;
          const result = loginResponse.Result ?? loginResponse.result;
          const token = result?.Token ?? result?.token;
          const errors = loginResponse.errors ?? loginResponse.Errors;

          if (!res.ok || !status || !token) {
            console.error("❌ Login failed:");
            console.error("  - Response OK:", res.ok);
            console.error("  - Status:", status);
            console.error("  - Has Token:", !!token);
            console.error("  - Errors:", errors);
            return null;
          }
          // Lets decode the role from JWT
          let role: string | undefined;
          try {
            const decodedToken = decodeJWT(token);
            role =
              decodedToken.UserRole ||
              decodedToken.userRole ||
              decodedToken.role ||
              decodedToken.Role ||
              decodedToken.roles?.[0];
          } catch (error) {
            console.warn("⚠️ Failed to decode JWT token:", error);
          }
          // Return user object
          const user = {
            id: credentials.email,
            token: token,
            email: credentials.email,
            role: role,
          };
          return user;
        } catch (error) {
          console.error("💥 Exception during login:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // ===== C# BACKEND: Store JWT token =====
        // C# backend returns single JWT token (no refresh token)
        token.access_token = user.token;

        // Decode JWT to extract role if not already set
        let role = user?.role;
        if (!role) {
          try {
            const decodedToken = decodeJWT(user.token);
            role =
              decodedToken.UserRole ||
              decodedToken.userRole ||
              decodedToken.role ||
              decodedToken.Role ||
              decodedToken.roles?.[0];
          } catch (error) {
            console.warn(
              "⚠️ Failed to decode JWT token in jwt callback:",
              error,
            );
          }
        }
        token.user = { email: user.email, role: user?.role };
        return token;
      }
      return token;
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.user = token.user;
      // Ensure role is set from token
      if (!session.user?.role && token.access_token) {
        try {
          const decodedToken = decodeJWT(token.access_token);
          session.user.role =
            decodedToken.UserRole ||
            decodedToken.userRole ||
            decodedToken.role ||
            decodedToken.Role ||
            decodedToken.roles?.[0];
        } catch (error) {
          console.warn(
            "⚠️ Failed to decode JWT token in session callback:",
            error,
          );
        }
      }

      // ====== OLD EXPRESS BACKEND (COMMENTED OUT) ======
      //  session.expires = new Date(token.access_token_expires_at).toISOString();
      return session;
    },
  },
  // useSecureCookies should only be true in production (HTTPS).
  // On HTTP localhost it prevents cookies from being sent, breaking auth entirely.
  useSecureCookies: process.env.NODE_ENV === "production",
};
