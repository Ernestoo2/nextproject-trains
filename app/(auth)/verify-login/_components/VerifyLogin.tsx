"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function VerifyLogin() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleVerify = () => {
    // Simulate verification logic
    if (code === "1234") {
      alert("Verification successful!");
      router.push("/set-password"); // Redirect back to login page
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  const handleResend = () => {
    alert("A new verification code has been sent to your email.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4FFF8] p-4">
      {/* Back to Forget Password */}
      <button
        onClick={() => router.push("/forgot-password")}
        className="self-start text-green-500 text-sm flex items-center space-x-1 mb-6"
      >
        <span>&larr;</span>
        <span>Back to Forgot Password</span>
      </button>

      {/* Verify Login Section */}
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Verify Your Login
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification code to your email. Enter the code below to
          verify and reset your password.
        </p>

        {/* Enter Code */}
        <div className="relative mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder=" "
          />
          <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600">
            Enter Verification Code
          </label>
        </div>

        {/* Resend Code */}
        <p className="text-sm text-gray-600 mb-4">
          Didn't receive a code?{" "}
          <button
            onClick={handleResend}
            className="text-red-600 hover:underline"
          >
            Resend Code
          </button>
        </p>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
