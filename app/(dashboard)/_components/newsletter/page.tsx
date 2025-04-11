"use client";
import React, { useState } from "react";
import mail from "../../../../public/Assets/mailbox.png";
import { IoIosSend } from "react-icons/io";
import Image from "next/image";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
      alert(`Email submitted successfully: ${email}`);
      setEmail(""); // Reset the email input
    }
  };

  return (
    <div className=" relative mb-[-40px]">
      <div className=" w-5/6 flex h-auto md:w-3/5 mx-auto gap-5 bg-[#CDEAE1] items-center justify-between rounded-md p-8  lg:p-12">
        <div className="w-full mb-2 md:w-2/3 md:mb-0 md:pr-12">
          <h2 className="text-xl w-full flex-wrap  md:text-2xl font-bold text-[#2D3748] mb-1">
            Subscribe Newsletter
          </h2>
          <h3 className="text-lg md:text-xl font-semibold text-[#4A5568] mb-1">
            The Travel
          </h3>
          <p className="text-xs break-normal  md:text-sm text-[#4A5568] mb-1">
            Get inspired! Receive travel discounts, tips and behind the scenes
            stories.
          </p>
          <div className="w-full max-w-md">
            <form
              className="relative flex items-center"
              onSubmit={handleSubmit}
            >
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48BB78] transition duration-300 ${
                    error
                      ? "border-red-500 text-red-500"
                      : "border-gray-300 text-gray-700"
                  }`}
                />
                <button
                  title="submit"
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#48BB78] hover:text-[#2F855A] transition duration-300"
                >
                  <IoIosSend size={28} />
                </button>
              </div>
            </form>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <div className="flex items-center justify-center w-2/3 md:w-1/2">
          <Image
            src={mail}
            alt="Mailbox"
            className="object-contain w-full h-auto md:max-w-md"
          />
        </div>
      </div>
    </div>
  );
}
