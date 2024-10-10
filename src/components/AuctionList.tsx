import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuctionContext } from "./AuctionContext";
import LoadingScreen from "./LoadingScreen";

const AuctionList: React.FC = () => {
  const { auctions, timeRemaining, loading } = useContext(AuctionContext)!; // Use the context here
  const navigate = useNavigate();

  if (loading) {
    <LoadingScreen />;;
  }

  // Filter only live auctions (those with auctionEndTime in the future)
  const liveAuctions = auctions
    .filter((auction) => Number(auction.auctionEndTime) > Math.floor(Date.now() / 1000))
    .sort((a, b) => Number(b.auctionEndTime) - Number(a.auctionEndTime));

  const pastAuctions = auctions
    .filter((auction) => Number(auction.auctionEndTime) < Math.floor(Date.now() / 1000))
    .sort((a, b) => Number(b.auctionEndTime) - Number(a.auctionEndTime));

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Today's Live Auctions</h2>
      {loading ? <p>Loading...</p>
        : pastAuctions.length === 0 ? (
          <p>No auctions available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {liveAuctions.map((auction) => ( // Generate Auction cards
              <div
                key={auction.address}
                className="bg-gray-800 h-96 rounded-lg shadow-lg text-center cursor-pointer hover:shadow-2xl"
                onClick={() => navigate(`/auction/${auction.address}`)}
              >
                {auction.imageurl && (
                  <div className="bg-gray-600 h-48 w-full flex justify-center items-center rounded-t-lg">
                    <img
                      src={auction.imageurl}
                      alt={auction.itemName}
                      className="w-full h-48 object-contain rounded-t-lg"
                    />
                  </div>
                )}
                <h3 className="mt-3 text-2xl font-semibold mb-4">{auction.itemName}</h3>
                <p className="text-lg mb-2">Highest Bid: {auction.highestBid} ETH</p>
                <p className="text-sm mb-4">
                  Time Remaining: {timeRemaining[auction.address] || "Loading..."}
                </p>
              </div>
            ))}
          </div>
        )}
      <h2 className="mt-6 text-3xl font-bold mb-6">Past Auctions</h2>
      {loading ? <p>Loading...</p>
        : pastAuctions.length === 0 ? (
          <p>No auctions available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {pastAuctions.map((auction) => ( // Generate Auction cards
              <div
                key={auction.address}
                className="bg-gray-800 h-96 rounded-lg shadow-lg text-center cursor-pointer hover:shadow-2xl"
                onClick={() => navigate(`/auction/${auction.address}`)}
              >
                <div className="bg-gray-600 h-48 w-full flex justify-center items-center rounded-t-lg">
                  {auction.imageurl ? (
                    <img
                      src={auction.imageurl}
                      alt={auction.itemName}
                      className="w-full h-48 object-contain rounded-t-lg"
                    />
                  ) : <span className="text-gray-300">
                      No Image Available
                    </span>
                  }
                </div>

                <h3 className="mt-3 text-2xl font-semibold mb-4">{auction.itemName}</h3>
                <p className="text-lg mb-2">Highest Bid: {auction.highestBid} ETH</p>
                {timeRemaining[auction.address] === 'Auction ended' ?
                  <p className='text-sm text-red-500 mb-4'>
                    {timeRemaining[auction.address]}
                  </p>
                  :
                  <p className='text-sm mb-4'>
                    Time Remaining: {timeRemaining[auction.address] || "Loading..."}
                  </p>
                }
              </div>
            ))}
          </div>
        )}
    </div>
  );

};

export default AuctionList;
