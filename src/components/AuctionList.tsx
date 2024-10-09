import React, { useEffect, useState } from "react";
import auctionFactoryContract from "../ethereum/auctionFactory"; // Default import
import { formatEther } from "ethers"; // Import formatEther directly from ethers v6
import { Link } from "react-router-dom";
import { getAuctionContract } from "../ethereum/auction"; // Make sure getAuctionContract is imported correctly

interface AuctionData {
  address: string;
  itemName: string;
  highestBid: string;
  imageurl: string;
  auctionEndTime: number;
}

const AuctionList: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const auctionAddresses: string[] =
          await auctionFactoryContract.getAuctions();

        const auctionData = await Promise.all(
          auctionAddresses.map(async (address) => {
            const auctionContract = await getAuctionContract(address);
            const itemName: string = await auctionContract.itemName();
            const highestBid = await auctionContract.highestBid();
            const imageurl: string = await auctionContract.itemImageURL(); // Fetch the image URL
            const auctionEndTime: number =
              await auctionContract.auctionEndTime(); // Fetch auction end time

            const highestBidFormatted = formatEther(highestBid); // Correct use of formatEther from ethers v6

            return {
              address,
              itemName,
              highestBid: highestBidFormatted,
              imageurl, // Set the image URL
              auctionEndTime,
            };
          })
        );

        setAuctions(auctionData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchAuctions();

    // Set an interval to refresh the auction list every minute
    const interval = setInterval(() => {
      fetchAuctions();
    }, 60000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    // Set up interval to update time remaining every second
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const newTimeRemaining: Record<string, string> = {};

      auctions.forEach((auction) => {
        const timeLeft = Number(auction.auctionEndTime) - currentTime; // Convert auctionEndTime to a normal number
        if (timeLeft <= 0) {
          newTimeRemaining[auction.address] = "Auction ended";
        } else {
          const days = Math.floor(timeLeft / (3600 * 24));
          const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
          const minutes = Math.floor((timeLeft % 3600) / 60);
          const seconds = timeLeft % 60;

          newTimeRemaining[
            auction.address
          ] = `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
        }
      });

      setTimeRemaining(newTimeRemaining);
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [auctions]);

  if (loading) {
    return <div className="max-w-4xl mx-auto py-8">Loading auctions...</div>;
  }

  return (
  <div className="max-w-7xl mx-auto py-8">
    <h2 className="text-3xl font-bold mb-6">Auctions</h2>
    {auctions.length === 0 ? (
      <p>No auctions available at the moment.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {auctions.map((auction) => ( // Generate Auction cards
          <div
            key={auction.address}
            className="bg-gray-800 h-96 rounded-lg shadow-lg p-6 text-center"
          >
            {auction.imageurl && (
              <img
                src={auction.imageurl}
                alt={auction.itemName}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-2xl font-semibold mb-4">{auction.itemName}</h3>
            <p className="text-lg mb-2">Highest Bid: {auction.highestBid} ETH</p>
            <p className="text-sm mb-4">
              Time Remaining: {timeRemaining[auction.address] || "Loading..."}
            </p>
            <Link
              to={`/auction/${auction.address}`}
              className="text-blue-500 hover:underline"
            >
              View Auction
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);

};

export default AuctionList;
