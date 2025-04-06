// components/Navbar.tsx
import React from 'react';
import Link from 'next/link';

// Icons
import { FaPlus, FaHeart, FaUserCircle } from "react-icons/fa";
import { CgFeed } from "react-icons/cg";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white text-black shadow-md w-full"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
        <div className="flex items-center justify-between h-16"> 

          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold hover:text-gray-700">
              Loop
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/create"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              <FaPlus/>
            </Link>
            <Link
              href="/feed"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              <CgFeed/>
            </Link>
            <Link
              href="/saved"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              <FaHeart/>
            </Link>
          </div>

          <div className="flex items-center">
            <Link
              href="/auth" 
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition duration-150 ease-in-out"
            >
              <FaUserCircle/>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;