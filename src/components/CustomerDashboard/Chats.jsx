import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";

const Chats = () => {
  const { id } = useParams();
  const projectId = id;
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const phone = useSelector((state) => state.users).phone;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const projectRef = doc(db, "projects", projectId);
        const q = query(
          collection(db, "groups"),
          where("projectRef", "==", projectRef),
          where("memberNums", "array-contains", phone)
        );
        const querySnapshot = await getDocs(q);
        const groupData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupData);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [projectId]);

  // Fetch messages for selected group
  const fetchMessages = async () => {
    if (selectedGroup) {
      try {
        const messagesRef = collection(
          db,
          "groups",
          selectedGroup.id,
          "chatMessages"
        );
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedMessages = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp
              ? new Date(data.timestamp.seconds * 1000)
              : null,
          };
        });
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };
  useEffect(() => {
    fetchMessages();
  }, [selectedGroup]);

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(
        db,
        "groups",
        selectedGroup.id,
        "chatMessages"
      );
      const timestamp = Timestamp.now();
      await addDoc(messagesRef, {
        message: newMessage,
        senderId: "+91" + phone, // Replace with dynamic sender ID
        timestamp,
      });
      setNewMessage(""); // Clear the input
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-full bg-gray-100" style={{ height: "82vh" }}>
      <div className="w-full grid grid-cols-3" style={{ height: "82vh" }}>
        <div className="p-3 border-r-2" style={{ height: "82vh" }}>
          <div className="flex justify-between border-r-2 mb-5">
            <div className="flex space-x-3">
              <h2 className="text-xl font-semibold">Chats</h2>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ height: "70vh" }}>
            {groups.length > 0 ? (
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`bg-white p-4 rounded-lg shadow flex justify-between items-center my-2 cursor-pointer ${
                    selectedGroup?.id === group.id
                      ? "bg-blue-100 border-l-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <span className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                    {group.groupName.charAt(0)}
                  </span>
                  <div>{group.groupName}</div>
                </div>
              ))
            ) : (
              <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center my-2">
                No Groups Found
              </div>
            )}
          </div>
        </div>
        {/* Group Chat */}
        <div className="col-span-2 p-3">
          {selectedGroup ? (
            <div
              className="flex flex-col overflow-y-auto"
              style={{ height: "80vh" }}
            >
              <div className="bg-gray-200 p-3 rounded-lg shadow">
                <h3 className="text-xl font-bold">{selectedGroup.groupName}</h3>
              </div>
              <div className="flex-grow bg-white my-3 p-4 rounded-lg shadow overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="my-2 p-2 bg-gray-100 rounded shadow"
                    >
                      <p>
                        <strong>{msg.senderId}:</strong> {msg.message}
                      </p>
                      <small>
                        {msg.timestamp ? msg.timestamp.toLocaleString() : ""}
                      </small>
                    </div>
                  ))
                ) : (
                  <p>No messages yet!</p>
                )}
              </div>
              <form
                className="flex items-center mt-3"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow border border-gray-300 rounded px-3 py-2"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="ml-3 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Select a group to start chatting!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
