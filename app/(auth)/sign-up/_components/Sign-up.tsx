"use client";
import { useState } from "react";
import sign from "../../../../public/Assets/Signup.png";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "@/_providers/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function SignUp() {
  // State variables for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  // State for handling API response
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const auth = useContext(AuthContext);
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
    if (!isAgreed) {
      setErrorMessage("You must agree to the terms and privacy policy.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      if (!auth) {
        throw new Error("Authentication context not available");
      }

      // Generate Naija Rails ID
      const naijaRailsId = `NR${Date.now().toString().slice(-8)}`;

      // Register with additional user data
      await auth.register(`${firstName} ${lastName}`, email, password);

      // Update user profile with additional data
      await auth.updateProfile({
        phone: phoneNumber,
        naijaRailsId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSuccessMessage("Account created successfully!");

      // Reset form fields immediately after successful registration
      resetFormFields();

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during registration";
      setErrorMessage(errorMessage);
    }
  };

  // Helper function to reset form fields
  const resetFormFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setConfirmPassword("");
    setIsAgreed(false);
  };

  return (
    <div className="flex w-5/6 flex-col   gap-5 mx-auto  md:flex-row items-center  justify-center min-h-screen ">
      {/* Image Section */}
      <div className="w-3/4 sm:w-2/3 sm: h-auto  flex justify-center items-center py-8 md:py-0">
        <Image
          src={sign}
          alt="Placeholder"
          className="rounded-lg w-3/4 h-full object-cover shadow-md"
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8  shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h2>
        <p className="text-gray-600 mb-6">
          Let's get you all set up so you can access your personal account.
        </p>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        {/* Success Message */}
        {successMessage && (
          <p className="text-green-500 mb-4">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="relative">
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <label
                htmlFor="firstName"
                className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600"
              >
                First Name
              </label>
            </div>

            {/* Last Name */}
            <div className="relative">
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <label
                htmlFor="lastName"
                className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Last Name
              </label>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Email
              </label>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <label
                htmlFor="phoneNumber"
                className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Phone Number
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600"
            >
              Password
            </label>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="peer w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <label
              htmlFor="confirmPassword"
              className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-600"
            >
              Confirm Password
            </label>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex w-full items-center  ">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mr-2"
              />
              <p className="text-xs gap-3">
                I agree to all the <span className="text-red-600"> Terms</span>{" "}
                and <span className="text-red-600">Privacy Policies</span>
              </p>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            disabled={auth?.loading}
          >
            {auth?.loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Social Sign-Up */}
        {/* Sign-up and Social Login */}
        <div className="text-center relative">
          <p className="text-sm text-[#4A5568]">
            Already have an account?{" "}
            <Link href="/login" className="text-red-600 hover:underline">
              Login
            </Link>
          </p>

          {/* Divider with Text */}
          <div className="relative w-full mt-4">
            <div className="h-[1px] w-full bg-[#112211]" />
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F4FFF8] px-2 text-sm text-[#4A5568]">
              Or login with
            </p>
          </div>
          <div
            className="flex items-center justify-center space-x-4 mt-4"
            title="button"
          >
            {/* Facebook */}
            <Link
              title="button"
              href={"https://www.facebook.com"}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <FaFacebook className="text-blue-600 w-5 h-5" />
            </Link>
            {/* Google */}
            <Link
              title="button"
              href={"/verify-email"}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <FaGoogle className="text-red-600 w-5 h-5" />
            </Link>
            {/* Apple */}
            <Link
              title="button"
              href={"/verify-email"}
              className="flex items-center justify-center w-24 h-10 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <FaApple className="text-black w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
