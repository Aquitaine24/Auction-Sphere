import { ReactNode } from 'react';
import { useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { firestore } from "../config/firebaseconfig";

interface BidHistoryProps {
  auctionId: string;
}

// Define a type for bid data
interface Bid {
  auctionId: string;
  bidAmount: number;
  bidderUid: string;
  bidderName: string;
  createdAt: any; // Can use 'Date' if you want to convert timestamps
}

const BidHistory = ({ auctionId }: BidHistoryProps) => {
  const [bidHistoryVisible, setBidHistoryVisible] = useState(false);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

  // Function to fetch bid history
  const fetchBidHistory = async () => {
    setLoadingBids(true);
    try {
      const bidsCollection = collection(firestore, "bids");

      // Query bids by auctionId and order them by createdAt
      const q = query(
        bidsCollection,
        where("auctionId", "==", auctionId),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);
      const bids: Bid[] = querySnapshot.docs.map((doc) => ({
        auctionId: doc.data().auctionId,
        bidAmount: doc.data().bidAmount,
        bidderUid: doc.data().bidderUid,
        bidderName: doc.data().bidderName,
        createdAt: doc.data().createdAt, // This is a Firestore Timestamp
      }));

      setBidHistory(bids);
    } catch (error) {
      console.error("Error fetching bids: ", error);
    } finally {
      setLoadingBids(false);
    }
  };

  // Toggle bid history modal visibility
  const toggleBidHistory = () => {
    if (!bidHistoryVisible) {
      fetchBidHistory(); // Fetch bids only when opening the modal
    }
    setBidHistoryVisible(!bidHistoryVisible);
  };

  return (
    <div className="mb-4">
      {/* Button to toggle bid history modal */}
      <p
        className="text-blue-500 mb-2 underline bg-transparent cursor-pointer"
        onClick={toggleBidHistory}
      >
        {bidHistoryVisible ? "Hide Bid History" : "View Bid History"}
      </p>

      {/* Modal for Bid History */}
      <Modal isOpen={bidHistoryVisible} onClose={toggleBidHistory}>
        <h2 className="text-lg font-bold mb-4">Bid History</h2>

        {loadingBids ? (
          <p>Loading bids...</p>
        ) : bidHistory.length > 0 ? (
          <ul>
            {bidHistory.map((bid, index) => (
              <li key={index} className="mb-2 flex justify-between">
                <p className="font-bold">{bid.bidAmount} ETH</p>
                <p>{bid.bidderName}</p>
                <p>{bid.createdAt.toDate().toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bids available</p>
        )}
      </Modal>
    </div>
  );
};

export default BidHistory;

// Component for the pop-up modal window =========
interface ModalProps {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg relative">
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>
          &times;
        </button>

        {/* Modal Content */}
        {children}
      </div>
    </div>
  );
};

