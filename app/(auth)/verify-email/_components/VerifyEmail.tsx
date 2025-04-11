"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false); // Only show input after sending email
  const router = useRouter();

  const handleSendEmail = () => {
    setEmailSent(true);
    setShowCodeInput(true);
    alert("Verification code has been sent to your email.");
  };

  const handleResendEmail = () => {
    alert("Verification code has been resent to your email.");
  };

  const handleVerify = () => {
    // Simulated verification logic
    if (code === "1234") {
      alert("Email verified successfully!");
      router.push("/user"); // Redirect to user page after successful verification
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4FFF8] p-4">
      {/* Back to Login */}
      <button
        onClick={() => router.push("/login")}
        className="self-start text-green-500 text-sm flex items-center space-x-1 mb-6"
      >
        <span>&larr;</span>
        <span>Back to login</span>
      </button>

      {/* Verify Email Section */}
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          To continue, we need to verify your email address. Click the button
          below to receive a verification code.
        </p>

        {/* Send Email Button */}
        {!emailSent && (
          <button
            onClick={handleSendEmail}
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            Send Verification Code
          </button>
        )}

        {/* Code Input */}
        {showCodeInput && (
          <>
            <div className="relative mt-6 mb-4">
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
              Didn’t receive a code?{" "}
              <button
                onClick={handleResendEmail}
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
              Verify Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
