"use client";

import React from "react";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Nav from "./variants/Nav";
import Logo from "./variants/Logo";
import Endside from "./variants/Endside";

const HeaderUi: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="w-full h-auto max-w-full px-4 py-2 mx-auto shadow relative">
      <div className="flex items-center">
        <Logo />
        <Nav />

        {/* Desktop Navigation */}
        <div className="hidden w-2/3 md:flex items-center">
          <Endside />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-2xl focus:outline-none"
            type="button"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#F4FFF8] shadow-lg z-50">
          <Endside />
        </div>
      )}
    </div>
  );
};

export default HeaderUi;
