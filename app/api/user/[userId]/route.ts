import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../utils/auth/next-auth";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Here you would typically fetch user data from your database
    // For now, we'll return the session user data
    return NextResponse.json(session.user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, dob } = body;

    // Here you would typically update the user data in your database
    // For now, we'll just return the updated data
    const updatedUser = {
      ...session.user,
      name,
      email,
      phone,
      address,
      dob,
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
