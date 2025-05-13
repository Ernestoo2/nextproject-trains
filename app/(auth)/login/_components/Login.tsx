"use client";
import Image from "next/image";
import Loginimg from "../../../../public/Assets/Loginpic.png";
import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { LOGIN_CONSTANTS } from "./_constants/login_constants";
import { LoginFormProps } from "./_types/login_type";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/_providers/auth/AuthContext";
import { toast } from "sonner";

export default function Login({ onSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("Authentication context not available");
      }

      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      await auth.login(email, password);
      toast.success("Login successful!");
      if (onSuccess) onSuccess();
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      // Implement social login logic here
      toast.info(`${provider} login coming soon!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Social login failed";
      toast.error(errorMessage);
    } finally {
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
          <div className="text-red-600 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleLogin} className="relative space-y-6 mt-4">
          {/* Email Input */}
          <div className="relative">
            <label
              htmlFor="email"
              className="absolute -top-2 left-3 bg-[#F4FFF8] px-1 text-sm text-[#4A5568]"
            >
              {LOGIN_CONSTANTS.EMAIL_LABEL}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder={LOGIN_CONSTANTS.EMAIL_PLACEHOLDER}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label
              htmlFor="password"
              className="absolute -top-2 left-3 bg-[#F4FFF8] px-1 text-sm text-[#4A5568]"
            >
              {LOGIN_CONSTANTS.PASSWORD_LABEL}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
              required
              disabled={isLoading}
            />
          </div>

          {/* Remember Me and Forgot Password */}
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#8DD3BB] text-white py-3 px-6 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : LOGIN_CONSTANTS.LOGIN_BUTTON}
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
              onClick={() => handleSocialLogin("Facebook")}
              disabled={isLoading}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFacebookF className="text-blue-600 w-5 h-5" />
            </button>
            {/* Google */}
            <button
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-red-600 w-5 h-5" />
            </button>
            {/* Apple */}
            <button
              onClick={() => handleSocialLogin("Apple")}
              disabled={isLoading}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
