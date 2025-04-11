"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { SET_PASSWORD_CONSTANTS } from "./_constants/setPassword_constants";
import {
  SetPasswordFormData,
  SetPasswordProps,
} from "./types/setPassword_types";

export default function SetPassword({ onSubmit, onBack }: SetPasswordProps) {
  const [formData, setFormData] = useState<SetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleVerify = () => {
    const { password, confirmPassword } = formData;

    // Ensure both password fields are filled
    if (password === "" || confirmPassword === "") {
      alert(SET_PASSWORD_CONSTANTS.VALIDATION_MESSAGES.EMPTY_FIELDS);
      return;
    }

    // Check password length (must be exactly 8 characters)
    if (password.length !== 8) {
      alert(SET_PASSWORD_CONSTANTS.VALIDATION_MESSAGES.LENGTH_ERROR);
      return;
    }

    // Check if password contains at least one letter and one number
    const containsLetter = /[a-zA-Z]/.test(password);
    const containsNumber = /[0-9]/.test(password);
    if (!containsLetter || !containsNumber) {
      alert(SET_PASSWORD_CONSTANTS.VALIDATION_MESSAGES.FORMAT_ERROR);
      return;
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      alert(SET_PASSWORD_CONSTANTS.VALIDATION_MESSAGES.MISMATCH_ERROR);
      return;
    }

    // If all validations pass
    alert(SET_PASSWORD_CONSTANTS.VALIDATION_MESSAGES.SUCCESS);
    onSubmit?.(password) || router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4FFF8] p-4">
      {/* Back to Login */}
      <button
        onClick={() => onBack?.() || router.push("/login")}
        className="self-start text-green-500 text-sm flex items-center space-x-1 mb-6"
      >
        <span>&larr;</span>
        <span>{SET_PASSWORD_CONSTANTS.BACK_TO_LOGIN}</span>
      </button>

      {/* Set Password Section */}
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {SET_PASSWORD_CONSTANTS.TITLE}
        </h2>
        <p className="text-gray-600 mb-6">
          {SET_PASSWORD_CONSTANTS.DESCRIPTION}
        </p>

        {/* Create Password */}
        <div className="relative mb-4">
          <label
            htmlFor="password"
            className="absolute -top-2 left-3 bg-[#F4FFF8] px-1 text-sm text-[#4A5568]"
          >
            {SET_PASSWORD_CONSTANTS.LABELS.CREATE_PASSWORD}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={SET_PASSWORD_CONSTANTS.PLACEHOLDERS.PASSWORD}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-2.5 text-gray-500"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible className="text-xl" />
            ) : (
              <AiOutlineEye className="text-xl" />
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-6">
          <label
            htmlFor="confirmPassword"
            className="absolute -top-2 left-3 bg-[#F4FFF8] px-1 text-sm text-[#4A5568]"
          >
            {SET_PASSWORD_CONSTANTS.LABELS.REENTER_PASSWORD}
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={SET_PASSWORD_CONSTANTS.PLACEHOLDERS.CONFIRM_PASSWORD}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-2.5 text-gray-500"
          >
            {showConfirmPassword ? (
              <AiOutlineEyeInvisible className="text-xl" />
            ) : (
              <AiOutlineEye className="text-xl" />
            )}
          </button>
        </div>

        {/* Set Password Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
        >
          {SET_PASSWORD_CONSTANTS.BUTTONS.SET_PASSWORD}
        </button>
      </div>
    </div>
  );
}
