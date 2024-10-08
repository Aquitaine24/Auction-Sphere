// src/components/CreateAuctionPage.tsx

import React, { useState, FormEvent } from "react";
import auctionFactoryContract from "../ethereum/auctionFactory";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const CreateAuctionPage: React.FC = () => {
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [biddingTime, setBiddingTime] = useState<string>(""); // In minutes
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const biddingTimeInSeconds = parseInt(biddingTime) * 60;
      const tx = await auctionFactoryContract.createAuction(
        biddingTimeInSeconds,
        itemName,
        itemDescription
      );

      await tx.wait();

      setMessage("Auction created successfully!");
      // Redirect to the auctions list or reset form
      navigate("/list"); // Adjust the path as needed
    } catch (error: any) {
      console.error(error);
      setMessage("Error creating auction. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Create Auction</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1">Item Name:</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-md border"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Item Description:</label>
          <textarea
            className="w-full px-4 py-2 rounded-md border"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label className="block mb-1">Bidding Time (minutes):</label>
          <input
            type="number"
            className="w-full px-4 py-2 rounded-md border"
            value={biddingTime}
            onChange={(e) => setBiddingTime(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {loading ? "Creating..." : "Create Auction"}
        </button>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default CreateAuctionPage;
