import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore, auth } from "../config/firebaseconfig";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const ChatBox: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherParticipant, setOtherParticipant] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (conversationId) {
      // Fetch messages for the conversation
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
        setLoading(false); // Set loading to false after fetching messages
      });

      // Fetch the conversation document to get participants
      const fetchConversation = async () => {
        try {
          const conversationRef = doc(firestore, "conversations", conversationId);
          const conversationDoc = await getDoc(conversationRef);

          if (conversationDoc.exists()) {
            const conversationData = conversationDoc.data();
            const participants = conversationData?.participants || [];

            // Filter out the current user's address (auth.currentUser?.uid)
            const otherParticipantAddress = participants.find(
              (participantId: string) => participantId !== auth.currentUser?.uid
            );

            setOtherParticipant(otherParticipantAddress || "Unknown Participant");
          }
        } catch (error) {
          console.error("Error fetching conversation:", error);
        }
      };

      fetchConversation();

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
      {/* Display the other participant's address */}
      <h2 className="text-white font-bold text-2xl mb-4">
        Conversation with: {otherParticipant || "Loading..."}
      </h2>
      <div className="chat-box overflow-y-auto max-h-[400px] mb-4 flex flex-col">
        {loading ? (
          <p className="text-white flex justify-center items-center h-full"><LoadingSpinner /></p> 
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg mb-2 inline-block max-w-xs break-words ${message.senderId === auth.currentUser?.uid
                ? "my-message bg-blue-500 ml-auto" // Add ml-auto for alignment
                : "other-message bg-gray-300"
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
