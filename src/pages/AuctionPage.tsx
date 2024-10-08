import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuctionContract } from "../ethereum/auction";
import { ethers, formatEther } from "ethers";

interface AuctionDetails {
  itemName: string;
  itemDescription: string;
  highestBid: string;
  highestBidder: string;
  imageurl: string;
}

const AuctionPage: React.FC = () => {
  const { address } = useParams<Record<string, string>>(); // Using Record<string, string> to type useParams
  const [auction, setAuction] = useState<AuctionDetails>({
    itemName: "",
    itemDescription: "",
    highestBid: "0",
    highestBidder: "",
    imageurl: "",
  });
  const [bidAmount, setBidAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      const fetchAuction = async () => {
        try {
          // Wait for the auction contract to be returned
          const auctionContract = await getAuctionContract(address);

          // Now you can call the functions on the auction contract
          const itemName: string = await auctionContract.itemName();
          const itemDescription: string =
            await auctionContract.itemDescription();
          const highestBid = await auctionContract.highestBid();
          const highestBidder: string = await auctionContract.highestBidder();
          const imageurl: string = await auctionContract.itemImageURL(); // Fetch the image URL

          setAuction({
            itemName,
            itemDescription,
            highestBid: formatEther(highestBid), // Correctly using ethers formatEther
            highestBidder,
            imageurl, // Set the image URL
          });
        } catch (error) {
          console.error(error);
        }
      };

      fetchAuction();
    }
  }, [address]);

  const placeBid = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!address) throw new Error("Invalid auction address");

      const auctionContract = await getAuctionContract(address);
      const tx = await auctionContract.bid({
        value: ethers.parseEther(bidAmount),
        gasLimit: 3000000,
      });
      await tx.wait();

      setMessage("Bid successfully placed!");
    } catch (error) {
      console.error(error);
      setMessage("Error placing bid: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async () => {
    setWithdrawing(true);
    setMessage("");

    try {
      if (!address) throw new Error("Invalid auction address");

      const auctionContract = await getAuctionContract(address);
      const tx = await auctionContract.withdraw();
      await tx.wait();

      setMessage("Funds successfully withdrawn!");
    } catch (error) {
      console.error(error);
      setMessage("Error withdrawing funds: " + (error as Error).message);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Auction Details</h2>
      <div className="p-4 border rounded-lg shadow-md">
        {auction.imageurl && (
          <img
            src={auction.imageurl}
            alt={auction.itemName}
            className="w-full h-60 object-cover rounded-md mb-4"
          />
        )}
        <h3 className="text-xl font-semibold mb-2">{auction.itemName}</h3>
        <p className="mb-2">{auction.itemDescription}</p>
        <p className="mb-2">Highest Bid: {auction.highestBid} ETH</p>
        <p className="mb-4">Highest Bidder: {auction.highestBidder}</p>

        <input
          type="text"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter your bid amount in ETH"
          className="p-2 border rounded mb-4 w-full"
        />
        <button
          onClick={placeBid}
          className="px-8 py-3 bg-blue-500 rounded-md text-white text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          disabled={loading}
        >
          {loading ? "Placing Bid..." : "Place Bid"}
        </button>

        <button
          onClick={withdrawFunds}
          className="mt-4 px-8 py-3 bg-red-500 rounded-md text-white text-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
          disabled={withdrawing}
        >
          {withdrawing ? "Withdrawing..." : "Withdraw Funds"}
        </button>

        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default AuctionPage;
