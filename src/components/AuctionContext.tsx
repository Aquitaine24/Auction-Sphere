import React, { createContext, useEffect, useState, ReactNode } from "react";
import auctionFactoryContract from "../ethereum/auctionFactory"; // Default import
import { formatEther } from "ethers"; // Import formatEther directly from ethers v6
import { getAuctionContract } from "../ethereum/auction"; // Ensure getAuctionContract is imported correctly

interface AuctionData {
  address: string;
  itemName: string;
  itemDescription: string; // New field for item description
  highestBid: string;
  highestBidder: string; // New field for highest bidder
  imageurl: string;
  auctionEndTime: number;
}

interface AuctionList {
  auctions: AuctionData[];
  timeRemaining: Record<string, string>;
  loading: boolean;
}

export const AuctionContext = createContext<AuctionList | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const auctionAddresses: string[] = await auctionFactoryContract.getAuctions();

        const auctionData = await Promise.all(
          auctionAddresses.map(async (address) => {
            const auctionContract = await getAuctionContract(address);
            const itemName: string = await auctionContract.itemName();
            const itemDescription: string = await auctionContract.itemDescription(); // Fetch the item description
            const highestBid = await auctionContract.highestBid();
            const highestBidder: string = await auctionContract.highestBidder(); // Fetch the highest bidder
            const imageurl: string = await auctionContract.itemImageURL(); // Fetch the image URL
            const auctionEndTime: number = await auctionContract.auctionEndTime(); // Fetch auction end time

            const highestBidFormatted = formatEther(highestBid); // Format the highest bid

            return {
              address,
              itemName,
              itemDescription, // Set the item description
              highestBid: highestBidFormatted,
              highestBidder, // Set the highest bidder
              imageurl,
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

    const interval = setInterval(() => {
      fetchAuctions();
    }, 60000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const newTimeRemaining: Record<string, string> = {};

      auctions.forEach((auction) => {
        const timeLeft = Number(auction.auctionEndTime) - currentTime;
        if (timeLeft <= 0) {
          newTimeRemaining[auction.address] = "Auction ended";
        } else {
          const days = Math.floor(timeLeft / (3600 * 24));
          const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
          const minutes = Math.floor((timeLeft % 3600) / 60);
          const seconds = timeLeft % 60;

          newTimeRemaining[auction.address] = `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
        }
      });

      setTimeRemaining(newTimeRemaining);
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [auctions]);

  return (
    <AuctionContext.Provider value={{ auctions, timeRemaining, loading }}>
      {children}
    </AuctionContext.Provider>
  );
};
