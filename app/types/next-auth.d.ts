import "next-auth";
import "next-auth/jwt";
import { SessionUser, UserRole } from "./shared/users";

declare module "next-auth" {
  interface User extends SessionUser { }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    naijaRailsId: string;
    picture?: string;
  }
}
