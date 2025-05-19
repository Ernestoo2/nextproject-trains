"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Get the MongoDB _id from the session
  const Id: string | undefined = session?.user?.id;

  

  return (
    <div className="w-full py-3 mx-auto text-black">
      <nav className="flex justify-center gap-4 md:gap-16 h-auto">
        <Link
          className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
            isActive("/trains/daily-trains")
              ? "text-green-600"
              : "hover:text-green-600"
          }`}
          href="/trains/daily-trains"
        >
          Trains Schedule
        </Link>
        {session?.user ? (
          <Link
            className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
              isActive(`/user/${Id}`)
                ? "text-green-600"
                : "hover:text-green-600"
            }`}
            href={`/user/${Id}`}
          >
            My Profile
          </Link>
        ) : (
          <Link
            className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
              isActive("/auth/login")
                ? "text-green-600"
                : "hover:text-green-600"
            }`}
            href="/login"
          >
            Login
          </Link>
        )}
        <Link
          className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
            isActive("/dashboard") ? "text-green-600" : "hover:text-green-600"
          }`}
          href="/dashboard"
        >
          Home
        </Link>
      </nav>
    </div>
  );
}
