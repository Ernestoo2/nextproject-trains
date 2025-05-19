"use client";
import { useState, useEffect } from "react";
import sign from "../../../../public/Assets/Signup.png";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Handle redirect after successful registration
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    if (successMessage) {
      redirectTimer = setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [successMessage, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      // Form validation
      if (!isAgreed) {
        setErrorMessage("You must agree to the terms and privacy policy.");
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters.");
        setIsSubmitting(false);
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMessage("First name and last name are required.");
        setIsSubmitting(false);
        return;
      }

      // Construct full name
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      toast.info("Creating your account...");

      // Call the new direct API endpoint instead
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: email.toLowerCase(),
          password,
          phone: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Registration failed";
        
        if (data.error) {
          errorMsg = data.error;
        } else if (data.details && Array.isArray(data.details)) {
          // Handle Zod validation errors
          errorMsg = data.details.map((err: any) => `${err.path}: ${err.message}`).join(", ");
        }
        
        throw new Error(errorMsg);
      }

      toast.success("Account created successfully!");
      setSuccessMessage("Account created successfully! Redirecting to login...");
      resetFormFields();

    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during registration";
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
      if(successMessage) setSuccessMessage(""); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setConfirmPassword("");
    setIsAgreed(false);
  };
  
  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsSubmitting(true);
      await signIn(provider, {
        callbackUrl: '/dashboard',
      });
      // Note: No need to handle success case here as signIn will redirect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Social signup failed";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-5/6 flex-col   gap-5 mx-auto  md:flex-row items-center  justify-center min-h-screen ">
      {/* Image Section */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex justify-center items-center py-6 md:py-0 order-2 md:order-1">
        <Image
          src={sign}
          alt="Illustration of people signing up for Naija Rails service"
          className="rounded-lg w-full max-w-md h-auto object-contain shadow-lg"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 sm:p-8 bg-white shadow-xl rounded-lg order-1 md:order-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 text-center px-1">Create Your Account</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base text-center px-1">
          Join Naija Rails today and unlock seamless train bookings.
        </p>

        {errorMessage && (
          <p className="text-red-500 mb-4 p-3 bg-red-50 border border-red-300 rounded-md text-sm">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="text-green-600 mb-4 p-3 bg-green-50 border border-green-300 rounded-md text-sm">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-0.5">
            <div className="relative px-0.5">
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="relative px-0.5">
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                required
                disabled={isSubmitting}
              />
            </div>
            </div>

          <div className="relative px-1">
            <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                required
                disabled={isSubmitting}
              />
            </div>

          <div className="relative px-1">
            <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number (e.g., 08012345678)" 
                className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:ring-green-500 focus:border-green-500 shadow-sm"
                disabled={isSubmitting}
            />
          </div>

          <div className="relative px-1">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 8 characters)"
              className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:ring-green-500 focus:border-green-500 shadow-sm" 
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>

          <div className="relative px-1">
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:ring-green-500 focus:border-green-500 shadow-sm" 
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center mt-4 px-1">
              <input
                type="checkbox"
                id="isAgreed"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isSubmitting}
            />
            <label htmlFor="isAgreed" className="ml-2 block text-xs sm:text-sm text-gray-700">
              I agree to Naija Rails 
              <Link href="/terms" className="font-medium text-green-600 hover:text-green-700"> Terms of Service</Link> and 
              <Link href="/privacy" className="font-medium text-green-600 hover:text-green-700"> Privacy Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70"
            disabled={isSubmitting || !isAgreed}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center px-1">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
              Log In
            </Link>
          </p>
        </div>

        {/* Social Logins */}
        <div className="mt-6 px-1">
          <div className="relative px-1">
            <div className="absolute inset-0 flex items-center px-1">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm px-1">
              <span className="bg-white px-2 text-gray-500">Or sign up with</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center space-x-4 px-1">
            {/* Facebook */}
            <button
              onClick={() => handleSocialSignup("facebook")}
              disabled={isSubmitting}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Facebook"
            >
              <FaFacebook className="text-blue-600 w-5 h-5" />
            </button>
            {/* Google */}
            <button
              onClick={() => handleSocialSignup("google")}
              disabled={isSubmitting}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Google"
            >
              <FaGoogle className="text-red-600 w-5 h-5" />
            </button>
            {/* Apple */}
            <button
              onClick={() => handleSocialSignup("apple")}
              disabled={isSubmitting}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Apple"
            >
              <FaApple className="text-black w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
