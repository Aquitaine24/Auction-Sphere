// HomePage.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to the search results page with the query as a parameter
    navigate(`/auctions?search=${encodeURIComponent(searchQuery)}`);
  };

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

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8 w-full max-w-md">
          <div className="flex items-center border-b border-gray-600 py-2">
            <input
              type="text"
              placeholder="Search for auctions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="appearance-none bg-white border-none w-full text-black mr-3 py-2 px-4 leading-tight focus:outline-none rounded-lg"
              style={{ height: "3rem" }}
            />
            <button
              type="submit"
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
            >
              Search
            </button>
          </div>
        </form>

        <div className="space-x-4">
          <Link
            to="/list"
            className="px-6 py-3 bg-blue-500 rounded-md text-white text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          >
            Go to Live Auctions
          </Link>
          <Link
            to="/create"
            className="px-6 py-3 bg-gray-700 rounded-md text-white text-lg hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-500"
          >
            Sell
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
