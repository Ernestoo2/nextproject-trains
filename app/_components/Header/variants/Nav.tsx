'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <div className="w-full py-3 mx-auto text-black">
      <nav className="flex justify-center gap-4 md:gap-16 h-auto">
        <Link
          className="text-center font-bold text-sm md:text-base lg:text-lg transition-colors hover:text-green-600"
          href="/trains/train-search"
        >
          Trains Schedule
        </Link>
        {session?.user ? (
          <Link
            className="text-center font-bold text-sm md:text-base lg:text-lg transition-colors hover:text-green-600"
            href={`/user/${session.user.id}`}
          >
            My Profile
          </Link>
        ) : (
          <Link
            className="text-center font-bold text-sm md:text-base lg:text-lg transition-colors hover:text-green-600"
            href="/auth/login"
          >
            Login
          </Link>
        )}
        <Link
          className="text-center font-bold text-sm md:text-base lg:text-lg transition-colors hover:text-green-600"
          href="/"
        >
          Home
        </Link>
      </nav>
    </div>
  );
}
