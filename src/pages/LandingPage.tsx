// LandingPage.tsx

import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/app-logo.png"; // Adjust the path to your logo

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center">
          <img src={logo} alt="App Logo" className="h-10 w-10" />
          <span className="text-white text-2xl font-bold ml-2">
            Auction Sphere
          </span>
        </div>
        <nav className="space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white">
            Sign In
          </Link>
          <Link to="/register" className="text-gray-300 hover:text-white">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow px-4">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">
          Welcome to Auction Sphere
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center max-w-2xl">
          Auction Sphere is a blockchain-powered auction platform that ensures
          transparency, security, and trust for both buyers and sellers.
          Leveraging the decentralized nature of blockchain, Auction Sphere
          offers a seamless, fair, and tamper-proof auction experience, bringing
          modern innovation to the traditional auction space.
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-500 rounded-md text-white text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-gray-700 rounded-md text-white text-lg hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-500"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 p-4 w-full">
        <p className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Auction Sphere. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
