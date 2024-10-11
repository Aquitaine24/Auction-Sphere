import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { firestore, auth } from "../config/firebaseconfig";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { ethers } from "ethers";

const ChatBox: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [otherParticipantName, setOtherParticipantName] = useState<string>("");
  const [userEthAddress, setUserEthAddress] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the current user's Ethereum address
    const fetchEthAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const checksumAddress = ethers.getAddress(accounts[0]);
          setUserEthAddress(checksumAddress);
          console.log("User Ethereum Address:", checksumAddress);
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
    const fetchConversationDetails = async () => {
      if (conversationId && userEthAddress) {
        // Fetch the conversation document by its ID
        const conversationDoc = await getDoc(doc(firestore, "conversations", conversationId));

        if (conversationDoc.exists()) {
          const conversationData = conversationDoc.data();
          console.log("Conversation Data:", conversationData);

          const otherParticipant = conversationData.participants.find(
            (address: string) => address !== userEthAddress
          );

          if (otherParticipant) {
            console.log("Other participant address:", otherParticipant);

            // Query the "users" collection for the user with the matching walletAddress
            const usersQuery = query(
              collection(firestore, "users"),
              where("walletAddress", "==", otherParticipant)
            );

            const querySnapshot = await getDocs(usersQuery);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userData = userDoc.data();

              setOtherParticipantName(userData.name || "Unknown User");
              console.log("Other participant name:", userData.name); // Debugging log
            } else {
              setOtherParticipantName("Unknown User");
              console.error("No user found with wallet address:", otherParticipant);
            }
          } else {
            // If no other participant, the user is chatting with themselves
            setOtherParticipantName("Yourself");
          }
        } else {
          console.error("Conversation document does not exist.");
        }
      }
    };

    if (conversationId && userEthAddress) {
      fetchConversationDetails();
    }
  }, [conversationId, userEthAddress]);

  useEffect(() => {
    if (conversationId) {
      const q = query(
        collection(firestore, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs: any[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() });
        });

        setMessages(msgs);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          await addDoc(collection(firestore, "messages"), {
            conversationId,
            senderId: userId,
            content: newMessage,
            createdAt: serverTimestamp(),
          });
          setNewMessage("");
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    }
  };

  return (
    <div className="chat-container bg-gray-800 max-w-7xl mx-auto rounded-lg p-8">
      <h2 className="text-white font-bold text-2xl mb-4">
        Conversation with: {otherParticipantName || "Loading..."}
      </h2>
      <div className="chat-box overflow-y-auto max-h-[400px] mb-4 flex flex-col">
        {loading ? (
          <p className="text-white flex justify-center items-center h-full">
            <LoadingSpinner />
          </p>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg mb-2 inline-block max-w-xs break-words ${message.senderId === auth.currentUser?.uid
                ? "my-message bg-blue-500 ml-auto"
                : "other-message bg-gray-600"
                }`}
            >
              {message.content}
            </div>
          ))
        ) : (
          <p className="text-white text-center">No messages to display.</p>
        )}
      </div>

      <div className="chat-input bg-gray-900 p-3 rounded-lg flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input bg-transparent p-2 outline-none rounded flex-1"
        />
        <button
          onClick={handleSendMessage}
          className="send-button bg-transparent text-blue-500 hover:text-blue-100 px-4 py-2 ml-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
