"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BookingSuccess from "./_components/BookingSuccess";

export default function BookingSuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  return <BookingSuccess />;
}
