"use client";
import { useState } from "react";
import { FaGithubSquare, FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin, FaSquareFacebook } from "react-icons/fa6";
import { ImSkype } from "react-icons/im";
import { IoIosSend } from "react-icons/io";
import Link from "next/link";
import React from "react";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
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

  const sections: FooterSection[] = [
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about" },
        { text: "Careers", href: "/careers" },
        { text: "Contact Us", href: "/contact" },
      ],
    },
    // ... other sections
  ];

  return (
    <footer className="bg-gray-800 text-white p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <Link href={link.href} className="hover:text-gray-300">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
