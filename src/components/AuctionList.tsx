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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        console.log("Fetching auction addresses...");
        const auctionAddresses: string[] =
          await auctionFactoryContract.getAuctions();

        if (auctionAddresses.length === 0) {
          console.log("No auctions found.");
          setAuctions([]);
          setLoading(false);
          return;
        }

        console.log("Auction addresses found:", auctionAddresses);
        const auctionData = await Promise.all(
          auctionAddresses.map(async (address) => {
            try {
              const auctionContract = await getAuctionContract(address);
              const itemName: string = await auctionContract.itemName();
              const highestBid = await auctionContract.highestBid();
              const imageurl: string = await auctionContract.itemImageURL();
              const auctionEndTime: number =
                await auctionContract.auctionEndTime();

              const highestBidFormatted = formatEther(highestBid);

              console.log(`Fetched auction data for address ${address}:`, {
                itemName,
                highestBid: highestBidFormatted,
                imageurl,
                auctionEndTime,
              });

              return {
                address,
                itemName,
                highestBid: highestBidFormatted,
                imageurl,
                auctionEndTime,
              };
            } catch (err) {
              console.error(
                `Error fetching data for auction at address ${address}:`,
                err
              );
              return null;
            }
          })
        );

        setAuctions(
          auctionData.filter((auction) => auction !== null) as AuctionData[]
        );
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
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

  const formatTimeRemaining = (endTime: number) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const auctionEndTime = Number(endTime); // Convert to a normal number

    const timeRemaining = auctionEndTime - currentTime;
    if (timeRemaining <= 0) return "Auction ended";

    const days = Math.floor(timeRemaining / (3600 * 24));
    const hours = Math.floor((timeRemaining % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-8">Loading auctions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Auctions</h2>
      {auctions.length === 0 ? (
        <p>No auctions available at the moment.</p>
      ) : (
        <div className="space-y-4">
          {auctions.map((auction) => (
            <div
              key={auction.address}
              className="p-4 border rounded-lg shadow-md"
            >
              {auction.imageurl && (
                <img
                  src={auction.imageurl}
                  alt={auction.itemName}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{auction.itemName}</h3>
              <p className="mb-2">Highest Bid: {auction.highestBid} ETH</p>
              <p className="mb-2">
                Time Remaining: {formatTimeRemaining(auction.auctionEndTime)}
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
