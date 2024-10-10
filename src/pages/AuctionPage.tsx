import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuctionContract } from "../ethereum/auction";
import { ethers, formatEther } from "ethers";
import { Clock4 } from "lucide-react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, firestore } from "../config/firebaseconfig";

interface AuctionDetails {
  itemName: string;
  itemDescription: string;
  highestBid: string;
  highestBidder: string;
  imageurl: string;
  auctionEndTime: number;
  sellerId: string;
}

const AuctionPage: React.FC = () => {
  const { address } = useParams<Record<string, string>>(); // Using Record<string, string> to type useParams
  const navigate = useNavigate();
  const [auction, setAuction] = useState<AuctionDetails>({
    itemName: "",
    itemDescription: "",
    highestBid: "0",
    highestBidder: "",
    imageurl: "",
    auctionEndTime: 0,
    sellerId: "",
  });
  const [bidAmount, setBidAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    placeBid: false,
    withdraw: false,
    endAuction: false,
  });
  const [timeRemaining, setTimeRemaining] = useState<string>("Loading...");
  const [imageLoading, setImageLoading] = useState<boolean>(true);

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
          const sellerId: string = await auctionContract.seller();

          setAuction({
            itemName,
            itemDescription,
            highestBid: formatEther(highestBid), // Correctly using ethers formatEther
            highestBidder,
            imageurl, // Set the image URL
            auctionEndTime,
            sellerId,
          });
        } catch (error) {
          console.error(error);
        } finally {
          setImageLoading(false);
        }
      };

      fetchAuction();
    }
  }, [address]);

  useEffect(() => {
    // Set up interval to update time remaining every second
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = Number(auction.auctionEndTime) - currentTime;
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

      // Fetch the highest bidder from the contract
      const highestBidder: string = await auctionContract.highestBidder();
      const sellerId: string = await auctionContract.seller();

      if (!sellerId) throw new Error("Seller information is unavailable");

      // Create a conversation between the seller and the highest bidder
      await createConversation(sellerId, highestBidder);
      navigate(`/conversations/${address}`);

      setMessage("Auction ended successfully, and conversation created!");
    } catch (error) {
      console.error("Error ending auction:", error);
      setMessage(
        "Failed to end auction. Please make sure the auction has ended."
      );
    } finally {
      setLoading({ ...loading, endAuction: false });
    }
  };

  const createConversation = async (sellerId: string, buyerId: string) => {
    try {
      // Check if conversation already exists between the two participants
      const conversationsRef = collection(firestore, "conversations");
      const q = query(
        conversationsRef,
        where("participants", "array-contains", sellerId)
      );
      const existingConversations = await getDocs(q);

      const conversationExists = existingConversations.docs.some((doc) =>
        doc.data().participants.includes(buyerId)
      );

      if (conversationExists) {
        console.log("Conversation already exists");
        return;
      }

      // Create a new conversation if it does not exist
      const conversationData = {
        participants: [sellerId, buyerId],
        createdAt: serverTimestamp(),
        lastMessage: "",
      };
      await addDoc(collection(firestore, "conversations"), conversationData);

      console.log("Conversation created successfully!");
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8">Auction Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="bg-gray-800 h-[520px] col-span-1 md:col-span-2 flex justify-center items-center rounded-lg shadow-lg overflow-hidden">
          {imageLoading ? (
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : auction.imageurl ? (
            <img
              src={auction.imageurl}
              alt={auction.itemName}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-gray-300">No Image Available</span>
          )}
        </div>

        {/* Details Section */}
        <div className="col-span-1">
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">{auction.itemName}</h2>
            {timeRemaining === "Auction ended" ? (
              <p className="text-sm text-red-500 mb-4 flex items-center">
                <Clock4 className="mr-2" />
                {timeRemaining}
              </p>
            ) : (
              <p className="text-sm mb-4 flex items-center">
                <Clock4 className="mr-2" />
                Time Remaining: {timeRemaining || "Loading..."}
              </p>
            )}
            <p className="text-md text-white mb-2">
              Description: {auction.itemDescription}
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-2">
              Highest Bid:{" "}
              <span className="text-blue-600">{auction.highestBid} ETH</span>
            </p>
            {auction.highestBidder !==
            "0x0000000000000000000000000000000000000000" ? (
              <p className="text-sm font-semibold mb-4">
                Highest Bidder:{" "}
                <span className="text-blue-600">{auction.highestBidder}</span>
              </p>
            ) : (
              <p className="text-sm font-semibold mb-4">No bids made yet</p>
            )}

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
            {message && (
              <p className="mt-4 text-center text-gray-700">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
