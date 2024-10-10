import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { firestore, auth } from "../config/firebaseconfig";
import { useParams } from "react-router-dom";

const ChatBox: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    if (conversationId) {
      const q = query(
        collection(firestore, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc") // Order by createdAt field
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs: any[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() });
        });

        console.log("Fetched messages:", msgs); // Log fetched messages
        setMessages(msgs);
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
            createdAt: serverTimestamp(), // Ensure this field is set correctly
          });
          setNewMessage("");
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    }
  };

  return (
    <div className="chat-container p-4 border rounded-lg">
      <div className="chat-box overflow-y-auto max-h-[400px] mb-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={
                message.senderId === auth.currentUser?.uid
                  ? "my-message bg-blue-500 p-2 rounded-lg mb-2"
                  : "other-message bg-gray-300 p-2 rounded-lg mb-2"
              }
            >
              {message.content}
            </div>
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
      <div className="chat-input flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input p-2 border rounded flex-1"
        />
        <button
          onClick={handleSendMessage}
          className="send-button bg-blue-500 text-white px-4 py-2 ml-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
