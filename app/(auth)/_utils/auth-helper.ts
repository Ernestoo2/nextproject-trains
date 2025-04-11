import { signIn } from "next-auth/react";
import type { LoginFormData } from "./validation";

export async function handleLogin(data: LoginFormData) {
  try {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during login",
    };
  }
}
