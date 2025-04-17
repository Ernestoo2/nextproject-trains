import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    naijaRailsId: string;
    name: string;
    email: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface Session {
    user: User;
  }
}
