// HomePage.tsx

import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-4xl font-bold mb-6">Welcome to Auction Sphere</h1>
        <p className="text-lg mb-8 text-center max-w-2xl">
          This is a simple home page matching the theme of your application. Use
          this area to highlight key features or provide introductory
          information.
        </p>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-500 rounded-md text-white text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/signin"
            className="px-6 py-3 bg-gray-700 rounded-md text-white text-lg hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-500"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
