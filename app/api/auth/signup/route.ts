import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    phone: z.string().optional(),
});

function generateNaijaRailsId() {
    const prefix = "NR";
    const randomNum = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(10, "0");
    return `${prefix}${randomNum}`;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = signupSchema.parse(body);

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Create user with minimal required fields
        const user = await User.create({
            email: validatedData.email.toLowerCase(),
            password: hashedPassword,
            name: validatedData.name,
            phone: validatedData.phone,
            role: "USER",
            naijaRailsId: generateNaijaRailsId(),
            isVerified: false,
        });

        // Remove password from response
        const userWithoutPassword = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            naijaRailsId: user.naijaRailsId,
        };

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
