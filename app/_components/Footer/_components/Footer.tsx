"use client";
import { useState } from "react";
import Link from "next/link";
import { FaGithubSquare, FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin, FaSquareFacebook } from "react-icons/fa6";
import { ImSkype } from "react-icons/im";
import { IoIosSend } from "react-icons/io";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
      alert(`Email submitted successfully: ${email}`);
      setEmail("");
    }
  };

  return (
    <div className="w-full p-14 bg-[#07561A] rounded-tr-[20px] rounded-bl-[20px] border">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start justify-between">
          <div className="w-full md:w-3/4 flex flex-col md:flex-row gap-4">
            <h1 className="text-base font-bold whitespace-nowrap">
              <span className="text-white">Naija</span>
              <span className="text-black">Rails</span>
            </h1>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-white">
                Planning your next trip?
              </h2>
              <p className="text-base text-white max-w-2xl">
                Naija Rails is a community-driven platform that connects
                Nigerians and locals with Nigerian businesses and services.
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/4 mt-4 md:mt-0">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="email"
                placeholder="Enter Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-base border-b-2 border-x-0 border-t-0 bg-transparent text-white placeholder-gray-300 focus:outline-none"
              />
              <button
                title="submit"
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <IoIosSend size={24} />
              </button>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </form>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 text-white">
            {[
              "About us",
              "Mobile",
              "Privacy",
              "Terms of use",
              "Career",
              "Customer Service",
            ].map((link) => (
              <Link key={link} href="/" className="text-base hover:underline">
                {link}
              </Link>
            ))}
          </div>

          <div className="flex gap-2">
            {[
              FaSquareFacebook,
              FaLinkedin,
              FaGithubSquare,
              ImSkype,
              FaInstagramSquare,
            ].map((Icon, index) => (
              <Icon
                key={index}
                className="fill-[#E2E2ED] w-7 h-7 hover:scale-110 transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
