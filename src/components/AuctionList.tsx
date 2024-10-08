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
}

const AuctionList: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);

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

            const highestBidFormatted = formatEther(highestBid); // Correct use of formatEther from ethers v6

            return {
              address,
              itemName,
              highestBid: highestBidFormatted,
              imageurl, // Set the image URL
            };
          })
        );

        setAuctions(auctionData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Auctions</h2>
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
            <Link
              to={`/auction/${auction.address}`}
              className="text-blue-500 hover:underline"
            >
              View Auction
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionList;
