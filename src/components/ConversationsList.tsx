import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebaseconfig";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userEthAddress, setUserEthAddress] = useState<string | null>(null);

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
      });

      return () => unsubscribeConversations();
    }
  }, [userEthAddress]);

  return (
    <div className="conversations-container p-4">
      <h2 className="text-2xl font-bold mb-4">Your Conversations</h2>
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <Link
            key={conv.id}
            to={`/chat/${conv.id}`}
            className="conversation-link block mb-3 p-3 border rounded hover:bg-gray-100"
          >
            <p className="font-medium">
              Conversation with:{" "}
              {conv.participants
                .filter(
                  (participantId: string) => participantId !== userEthAddress
                )
                .join(", ")}
            </p>
          </Link>
        ))
      ) : (
        <p>No conversations to display.</p>
      )}
    </div>
  );
};

export default ConversationsList;
