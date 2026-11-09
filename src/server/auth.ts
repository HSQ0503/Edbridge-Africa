import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { prisma } from "./db";
import { sendEmails } from "./notify";

const CODE_LIFETIME_MINUTES = 10;

async function emailSignInCode({ user, otp }: { user: { email: string }; otp: string }) {
  const sent = await sendEmails([
    {
      to: user.email,
      subject: `${otp} is your EdBridge sign-in code`,
      text: `Your EdBridge staff portal sign-in code is ${otp}. It expires in ${CODE_LIFETIME_MINUTES} minutes.\n\nIf you didn't just try to sign in, tell the IT team straight away: someone may know your password.`,
    },
  ]);
  if (!sent && process.env.NODE_ENV !== "production") console.info(`[auth] Sign-in code for ${user.email}: ${otp}`);
}

// There is no /api/auth route: staff sign in through Server Actions only, which keeps the attack surface small.
export const auth = betterAuth({
  appName: "EdBridge Africa",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  user: {
    // Only a staff admin can change this, through the portal; it is never accepted from a request body.
    additionalFields: { isStaffAdmin: { type: "boolean", defaultValue: false, input: false } },
  },
  emailAndPassword: {
    enabled: true,
    // Set-password links are made by staff admins in the portal (src/server/staff-accounts.ts); there is no
    // self-service reset. Using a link signs the person out everywhere.
    revokeSessionsOnPasswordReset: true,
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
  plugins: [
    // The second step is a code sent to the staff member's email, not an authenticator app.
    twoFactor({
      issuer: "EdBridge Africa",
      totpOptions: { disable: true },
      otpOptions: { sendOTP: emailSignInCode, period: CODE_LIFETIME_MINUTES, storeOTP: "hashed" },
    }),
    nextCookies(),
  ],
});
