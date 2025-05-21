import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "../mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import bcrypt from "bcryptjs";
import { UserRole } from "@/types/shared/users";

// Validate the role or return default
function getValidRole(role: string | undefined): UserRole {
  return role === "USER" ? "USER" : "USER"; // Currently only supporting "USER" role
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
          if (!user) {
            console.error(`Login attempt with non-existent email: ${credentials.email}`);
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            console.error(`User found but password field is missing: ${credentials.email}`);
            throw new Error("Invalid account configuration. Please contact support.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error(`Invalid password attempt for user: ${credentials.email}`);
            throw new Error("Invalid password");
          }

          console.error(`Successful login for user: ${credentials.email}`);
          
          // Return user data for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: getValidRole(user.role),
            naijaRailsId: user.naijaRailsId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    signOut: "/auth/logout",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = getValidRole(user.role);
        token.naijaRailsId = user.naijaRailsId;
        token.email = user.email || "";
        token.name = user.name || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = getValidRole(token.role as string);
        session.user.naijaRailsId = token.naijaRailsId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      // Default to baseUrl if url is not relative
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await connectDB();
        await User.findByIdAndUpdate(user.id, {
          $set: { lastLogin: new Date() },
        });
      } catch (error) {
        console.error("Error updating user login info:", error);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
