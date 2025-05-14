import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { User } from "@/utils/mongodb/models/User";
import bcrypt from "bcryptjs";
import { SessionUser, UserRole } from "@/types/shared/users";
import { connectDB } from "@/utils/mongodb/models/connect";

// Extend the Session type to include provider
declare module "next-auth" {
    interface Session {
        user: SessionUser;
        provider?: string;
    }
    
    interface JWT {
        id: string;
        role: UserRole;
        naijaRailsId: string;
        provider?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
        }),
        AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "name email"
                }
            }
        }),
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

                    const user = await User.findOne({
                        email: credentials.email.toLowerCase()
                    }).select("+password");

                    if (!user) {
                        throw new Error("No user found with this email");
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }

                    // Return session user data
                    const sessionUser: SessionUser = {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role || "USER",
                        naijaRailsId: user.naijaRailsId,
                        image: user.image,
                    };

                    return sessionUser;
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
                // Update token data from user
                token.id = user.id;
                token.role = user.role;
                token.naijaRailsId = user.naijaRailsId;
                token.email = user.email ?? "";
                token.name = user.name ?? "";
                token.picture = user.image ?? "";
            }
            
            // Save additional provider info if available
            if (account) {
                token.provider = account.provider;
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // Update session data from token
                session.user = {
                    id: token.id,
                    email: token.email,
                    name: token.name,
                    role: token.role as UserRole,
                    naijaRailsId: token.naijaRailsId,
                    image: token.picture,
                };
                
                // Add provider info to session if available
                if (token.provider) {
                    session.provider = token.provider as string;
                }
            }
            return session;
        },
    },
    events: {
        async signIn({ user, account }) {
            try {
                await connectDB();
                
                // For social logins, we might need to create or update the user
                if (account && account.provider !== "credentials") {
                    const existingUser = await User.findOne({ email: user.email });
                    
                    if (existingUser) {
                        // Update existing user with provider info
                        await User.findByIdAndUpdate(existingUser._id, {
                            lastLogin: new Date(),
                            image: user.image || existingUser.image,
                            name: user.name || existingUser.name,
                        });
                    } else {
                        // Create new user from social login
                        const newUser = await User.create({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            naijaRailsId: generateNaijaRailsId(),
                            role: "USER",
                            isVerified: true, // Social logins are already verified by the provider
                            provider: account.provider,
                            providerId: account.providerAccountId,
                        });
                        
                        // Update the user ID in the token
                        user.id = newUser._id.toString();
                    }
                } else {
                    // Regular credential login update
                    await User.findByIdAndUpdate(user.id, {
                        lastLogin: new Date(),
                    });
                }
            } catch (error) {
                console.error("Error updating user login info:", error);
            }
        },
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to generate unique Naija Rails ID for new social login users
function generateNaijaRailsId() {
    const prefix = "NR";
    const randomNum = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(10, "0");
    return `${prefix}${randomNum}`;
}
