import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { prisma } from "./db";

// There is no /api/auth route: staff sign in through Server Actions only, which keeps the attack surface small.
export const auth = betterAuth({
  appName: "EdBridge Africa",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Staff accounts are created by an administrator, never by self sign-up.
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: {
    // Hard 12-hour ceiling; the 30-minute idle timeout is enforced in staff.ts.
    expiresIn: 60 * 60 * 12,
    disableSessionRefresh: true,
  },
  telemetry: { enabled: false },
  plugins: [twoFactor({ issuer: "EdBridge Africa" }), nextCookies()],
});
