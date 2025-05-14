"use client";
import Image from "next/image";
import Loginimg from "../../../../public/Assets/Loginpic.png";
import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { LOGIN_CONSTANTS } from "./_constants/login_constants";
import { LoginFormProps } from "./_types/login_type";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function Login({ onSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Login successful!");
      if (onSuccess) onSuccess();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        callbackUrl: '/dashboard',
      });
      // Note: No need to handle success case here as signIn will redirect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Social login failed";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl w-full h-auto mx-auto p-6 rounded-lg shadow-md">
      {/* Left Side: Form */}
      <div className="md:w-1/2 h-auto">
        <h1 className="text-3xl font-bold text-[#2D3748]">Login</h1>
        <p className="text-[#4A5568]">{LOGIN_CONSTANTS.SUBTITLE}</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-500 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {LOGIN_CONSTANTS.EMAIL_LABEL}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder={LOGIN_CONSTANTS.EMAIL_PLACEHOLDER}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {LOGIN_CONSTANTS.PASSWORD_LABEL}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                disabled={isLoading}
              />
              <span className="text-sm text-[#4A5568]">
                {LOGIN_CONSTANTS.REMEMBER_ME}
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-red-600 hover:underline"
            >
              {LOGIN_CONSTANTS.FORGOT_PASSWORD}
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#8DD3BB] text-white py-3 px-6 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...
              </span>
            ) : (
              LOGIN_CONSTANTS.LOGIN_BUTTON
            )}
          </button>
        </form>

        {/* Sign-up and Social Login */}
        <div className="text-center relative">
          <p className="text-sm text-[#4A5568]">
            {LOGIN_CONSTANTS.NO_ACCOUNT}
            <Link href="/sign-up" className="text-red-600 hover:underline">
              {LOGIN_CONSTANTS.SIGN_UP}
            </Link>
          </p>

          {/* Divider with Text */}
          <div className="relative w-full mt-4">
            <div className="h-[1px] w-full bg-[#112211]" />
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F4FFF8] px-2 text-sm text-[#4A5568]">
              {LOGIN_CONSTANTS.OR_LOGIN_WITH}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            {/* Facebook */}
            <button
              onClick={() => handleSocialLogin("facebook")}
              disabled={isLoading}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Continue with Facebook"
            >
              <FaFacebookF className="text-blue-600 w-5 h-5" />
            </button>
            {/* Google */}
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Continue with Google"
            >
              <FaGoogle className="text-red-600 w-5 h-5" />
            </button>
            {/* Apple */}
            <button
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Continue with Apple"
            >
              <FaApple className="text-black w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="mt-4 w-full h-auto mx-auto md:mt-0 md:ml-8 md:w-1/2">
        <div className="w-full h-auto rounded-lg flex items-center justify-center">
          <Image
            src={Loginimg}
            width={100}
            height={100}
            className="w-2/3 md:w-full rounded-lg shadow-md"
            alt="Login pic"
          />
        </div>
      </div>
    </div>
  );
}
