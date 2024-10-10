import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "../config/firebaseconfig";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      const q = query(
        collection(firestore, "conversations"),
        where("participants", "array-contains", userId)
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
  }, [userId]);

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
                .filter((participantId: string) => participantId !== userId)
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
