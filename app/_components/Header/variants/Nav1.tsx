"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav1() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-full   py-3 mx-auto text-black">
      <nav className="flex justify-center gap-4 md:gap-16 h-auto">
        <Link
          className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
            isActive("/") ? "text-green-600" : "hover:text-green-600"
          }`}
          href="/"
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
        <Link
          className={`text-center font-bold text-sm md:text-base lg:text-lg transition-colors ${
            isActive("/user") ? "text-green-600" : "hover:text-green-600"
          }`}
          href="/user"
        >
          User Profile
        </Link>
      </nav>
    </div>
  );
}

export default Nav1;
