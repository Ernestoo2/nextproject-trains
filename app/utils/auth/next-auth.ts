import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "../mongodb/connect";
import { User } from "../mongodb/models/User";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

interface ExtendedToken extends JWT {
  id: string;
  naijaRailsId: string  ;
  role: string ;

}

interface ExtendedSession extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    naijaRailsId: string;
    role?: string ;
  }
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
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select(
            "+password",
          );

          if (!user || !user.password) {
            throw new Error("No user found with this email");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user without sensitive data
          const { password: _, ...userWithoutPassword } = user.toObject();
          return {
            ...userWithoutPassword,
            id: userWithoutPassword._id.toString(), // Convert MongoDB _id to string
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Include MongoDB _id and other user data in the token
        token.id = user.id;
        token.naijaRailsId = user.naijaRailsId;
        token.role = user.role || "user";
        token.email = user.email;
        token.name = user.name;
      }
      return token as ExtendedToken;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Include MongoDB _id and other user data in the session
        session.user.id = token.id as string;
        session.user.naijaRailsId = token.naijaRailsId as string;
        session.user.role = token.role as string;
        session.user.email = token.email || "";
        session.user.name = token.name || "";
      }
      return session as ExtendedSession;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
