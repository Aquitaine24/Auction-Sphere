import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuctionContract } from "../ethereum/auction";
import { ethers, formatEther } from "ethers";
import { Clock4 } from "lucide-react";

interface AuctionDetails {
  itemName: string;
  itemDescription: string;
  highestBid: string;
  highestBidder: string;
  imageurl: string;
  auctionEndTime: number;
}

const AuctionPage: React.FC = () => {
  const { address } = useParams<Record<string, string>>(); // Using Record<string, string> to type useParams
  const [auction, setAuction] = useState<AuctionDetails>({
    itemName: "",
    itemDescription: "",
    highestBid: "0",
    highestBidder: "",
    imageurl: "",
    auctionEndTime: 0,
  });
  const [bidAmount, setBidAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    placeBid: false,
    withdraw: false,
    endAuction: false,
  });
  const [timeRemaining, setTimeRemaining] = useState<string>("Loading...");

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
          const auctionEndTime: number = await auctionContract.auctionEndTime();

          setAuction({
            itemName,
            itemDescription,
            highestBid: formatEther(highestBid), // Correctly using ethers formatEther
            highestBidder,
            imageurl, // Set the image URL
            auctionEndTime,
          });
        } catch (error) {
          console.error(error);
        }
      };

      fetchAuction();
    }
  }, [address]);

  useEffect(() => {
    // Set up interval to update time remaining every second
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = auction.auctionEndTime - currentTime;
      if (timeLeft <= 0) {
        setTimeRemaining("Auction ended");
      } else {
        const days = Math.floor(timeLeft / (3600 * 24));
        const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        setTimeRemaining(
          `${days}d ${hours}h ${minutes}m ${seconds}s remaining`
        );
      }
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [auction.auctionEndTime]);

  const placeBid = async () => {
    setLoading({ ...loading, placeBid: true });
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
      setMessage("Failed to place bid. Please try again.");
    } finally {
      setLoading({ ...loading, placeBid: false });
    }
  };

  const withdrawFunds = async () => {
    setLoading({ ...loading, withdraw: true });
    setMessage("");

    try {
      if (!address) throw new Error("Invalid auction address");

      const auctionContract = await getAuctionContract(address);
      const tx = await auctionContract.withdraw();
      await tx.wait();

      setMessage("Funds successfully withdrawn!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to withdraw funds. Please try again later");
    } finally {
      setLoading({ ...loading, withdraw: false });
    }
  };

  const endAuction = async () => {
    setLoading({ ...loading, endAuction: true });
    setMessage("");

    try {
      if (!address) throw new Error("Invalid auction address");
      const auctionContract = await getAuctionContract(address);
      const tx = await auctionContract.auctionEnd();
      await tx.wait();
      setMessage("Auction ended successfully!");
    } catch (error) {
      console.error("Error ending auction:", error);
      setMessage(
        "Failed to end auction. Please make sure the auction has ended"
      );
    } finally {
      setLoading({ ...loading, endAuction: false });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Auction Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="bg-gray-800 h-[520px] col-span-1 md:col-span-2 flex justify-center items-center rounded-lg shadow-lg overflow-hidden">
          {auction.imageurl && (
            <img
              src={auction.imageurl}
              alt={auction.itemName}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Details Section */}
        <div className="col-span-1">
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">{auction.itemName}</h2>
            {timeRemaining === 'Auction ended' ?
              <p className='text-sm text-red-500 mb-4 flex items-center'>
                <Clock4 className="mr-2" />{timeRemaining}
              </p>
              :
              <p className='text-sm mb-4 flex items-center'>
                <Clock4 className="mr-2" />Time Remaining: {timeRemaining || "Loading..."}
              </p>
            }
            <p className="text-md text-white mb-6">
              Description: {auction.itemDescription}
            </p>
          </div>


          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-2">
              Highest Bid: <span className="text-blue-600">{auction.highestBid} ETH</span>
            </p>
            {auction.highestBidder !== '0x0000000000000000000000000000000000000000' ?
              <p className="text-lg font-semibold mb-4">
                Highest Bidder: <span className="text-blue-600">{auction.highestBidder}</span>
              </p>
              : <p className="text-lg font-semibold mb-4">
                No bids made yet
              </p>}

            {/* Bid Input */}
            <input
              type="text"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your bid amount in ETH"
              className="p-2 border rounded w-full mb-4 focus:outline-none focus:ring focus:ring-blue-300"
            />

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={placeBid}
                className="w-full px-8 py-3 bg-blue-500 rounded-md text-white text-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
                disabled={loading.placeBid}
              >
                {loading.placeBid ? "Placing Bid..." : "Place Bid"}
              </button>

              <button
                onClick={withdrawFunds}
                className="w-full px-8 py-3 bg-red-500 rounded-md text-white text-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
                disabled={loading.withdraw}
              >
                {loading.withdraw ? "Withdrawing..." : "Withdraw Funds"}
              </button>

              <button
                onClick={endAuction}
                className="w-full px-8 py-3 bg-red-500 rounded-md text-white text-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
                disabled={loading.endAuction}
              >
                {loading.endAuction ? "Ending Auction..." : "End Auction"}
              </button>
            </div>

            {/* Message */}
            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
