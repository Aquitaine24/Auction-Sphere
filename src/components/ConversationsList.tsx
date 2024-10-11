import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebaseconfig";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import LoadingSpinner from "./LoadingSpinner";

const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userEthAddress, setUserEthAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<{ [walletAddress: string]: string }>({});

  useEffect(() => {
    const fetchEthAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const checksumAddress = ethers.getAddress(accounts[0]); // Convert to checksum format
          setUserEthAddress(checksumAddress);
          console.log("User Ethereum Address:", checksumAddress); // Debugging log
        } catch (error) {
          console.error("Error fetching Ethereum address:", error);
        }
      } else {
        console.error("MetaMask is not installed.");
      }
    };

    fetchEthAddress();
  }, []);

  useEffect(() => {
    // Fetch users data once
    const fetchUsers = async () => {
      const usersQuery = query(collection(firestore, "users"));
      const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
        const usersMap: { [walletAddress: string]: string } = {};
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          // Assuming userData contains walletAddress and displayName fields
          if (userData.walletAddress) {
            usersMap[userData.walletAddress] = userData.name; // Map wallet address to display name
          }
        });
        setUsers(usersMap);
      });

      return () => {
        unsubscribeUsers();
      };
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (userEthAddress) {
      const q = query(
        collection(firestore, "conversations"),
        where("participants", "array-contains", userEthAddress)
      );

      const unsubscribeConversations = onSnapshot(q, (querySnapshot) => {
        const convs: any[] = [];
        querySnapshot.forEach((doc) => {
          convs.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched conversations:", convs); // Debugging log
        setConversations(convs);
        setLoading(false);
      });

      return () => {
        unsubscribeConversations();
        setLoading(false);
      };
    }
  }, [userEthAddress]);

  return (
    <div className="conversations-container max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">Your Conversations</h2>
      {loading ? (
        <p className="text-white flex justify-center items-center h-full">
          <LoadingSpinner />
        </p>
      ) : conversations.length > 0 ? (
        conversations.map((conv) => {
          // Find the other participant's address
          const otherParticipant = conv.participants.find(
            (address: string) => address !== userEthAddress
          );

          // Get the display name of the other participant
          const otherParticipantName = otherParticipant
            ? users[otherParticipant] || "Unknown User"
            : "Unknown User";

          const isSelfConvo = otherParticipant === undefined;

          return (
            <Link
              key={conv.id}
              to={`/chat/${conv.id}`}
              className="conversation-link block mb-3 p-6 rounded bg-gray-800 hover:bg-gray-700"
            >
              <p className="text-white">
                Conversation with: {isSelfConvo ? 'Yourself' : otherParticipantName}
              </p>
            </Link>
          );
        })
      ) : (
        <p>No conversations to display.</p>
      )}
    </div>
  );
};

export default ConversationsList;
