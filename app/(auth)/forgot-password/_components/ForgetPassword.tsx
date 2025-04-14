"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FORGOT_PASSWORD_CONSTANTS } from "../_constants/forgetPassword_constants";

import {
  ForgotPasswordFormData,
  ForgotPasswordProps,
  ForgotPasswordResponse,
} from "../types/forgotPassword_types";

export default function ForgotPassword({
  onSubmit,
  onBack,
}: ForgotPasswordProps) {
  const [FormData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const router = useRouter();

  const handleSubmit = () => {
    if (FormData.email) {
      alert(FORGOT_PASSWORD_CONSTANTS.SUCCESS_MESSAGE);
      router.push("/verify-login"); // Route to verify login page
    } else {
      alert(FORGOT_PASSWORD_CONSTANTS.EMAIL_REQUIRED);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4FFF8] p-4">
      {/* Back to Login */}
      <button
        onClick={() => router.push("/login")}
        className="self-start text-black text-sm flex items-center space-x-1 mb-6"
      >
        <span>&larr;</span>
        <span>{FORGOT_PASSWORD_CONSTANTS.BACK_TO_LOGIN}</span>
      </button>

      {/* Forget Password Section */}
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {FORGOT_PASSWORD_CONSTANTS.TITLE}
        </h2>
        <p className="text-gray-600 mb-6">
          {FORGOT_PASSWORD_CONSTANTS.DESCRIPTION}
        </p>

        {/* Email Input */}
        <div className="relative mb-6">
          <label
            htmlFor="email"
            className="absolute -top-2 left-3 bg-[#F4FFF8] px-1 text-sm text-[#4A5568]"
          >
            {FORGOT_PASSWORD_CONSTANTS.EMAIL_LABEL}
          </label>
          <input
            type="email"
            id="email"
            value={FormData.email}
            onChange={(e) =>
              setFormData({ ...FormData, email: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder={FORGOT_PASSWORD_CONSTANTS.EMAIL_PLACEHOLDER}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#8DD3BB] text-white py-2 rounded-md hover:bg-green-600 transition"
        >
          {FORGOT_PASSWORD_CONSTANTS.SUBMIT_BUTTON}
        </button>
      </div>
    </div>
  );
}
