"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function Nav1() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-full py-3 mx-auto text-black">
      <nav className="flex justify-center gap-4 md:gap-16 h-auto">
        <Link
          className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
            isActive("/dashboard") ? "text-green-600" : "hover:text-green-600"
          }`}
          href="/dashboard"
        >
          Home
        </Link>
        <Link
          className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
            isActive("/trains/train-search")
              ? "text-green-600"
              : "hover:text-green-600"
          }`}
          href="/trains/train-search"
        >
          Trains Schedule
        </Link>
        {session?.user ? (
          <Link
            className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
              pathname.startsWith("/user/")
                ? "text-green-600"
                : "hover:text-green-600"
            }`}
            href={`/user/${session.user.id}`}
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
            href="/auth/login"
          >
            Login
          </Link>
        )}
      </nav>
    </div>
  );
}

export default Nav1;
