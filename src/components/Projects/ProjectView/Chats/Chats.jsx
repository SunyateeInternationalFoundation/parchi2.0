import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import CreateGroupSideBar from "./CreateGroupSideBar";

const Chats = () => {
  const { id } = useParams();
  const projectId = id;

  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch customers and vendors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          const customerRefs = Array.isArray(projectData.customerRef) ? projectData.customerRef : [];
          const vendorRefs = Array.isArray(projectData.vendorRef) ? projectData.vendorRef : [];

          const customerDetails = await Promise.all(
            customerRefs.map(async (ref) => {
              const customerDoc = await getDoc(ref);
              return { id: customerDoc.id, ...customerDoc.data() };
            })
          );

          const vendorDetails = await Promise.all(
           vendorRefs.map(async (ref) => {
              const vendorDoc = await getDoc(ref);
              return { id: vendorDoc.id, ...vendorDoc.data() };
            })
          );

          setCustomers(customerDetails);
          setVendors(vendorDetails);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const projectRef = doc(db, "projects", projectId);
        const q = query(
          collection(db, "groups"),
          where("projectRef", "==", projectRef)
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
        senderId: "+918608770947", // Replace with dynamic sender ID
        timestamp,
      });
      setNewMessage(""); // Clear the input
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle group creation
  const handleGroupCreate = async (groupData) => {
    try {
      const newGroupRef = await addDoc(collection(db, "groups"), groupData);
      const newGroup = { id: newGroupRef.id, ...groupData };
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      alert("Group added successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="w-full bg-gray-100" style={{ height: "92vh" }}>
      <div className="w-full grid grid-cols-3" style={{ height: "92vh" }}>
        <div className="p-3 border-r-2" style={{ height: "92vh" }}>
          <div className="flex justify-between border-r-2 mb-5">
            <div className="flex space-x-3">
              <Link
                className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
                to={"./../"}
              >
                <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
              </Link>
              <h2 className="text-xl font-semibold">Chats</h2>
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white py-1 px-2 rounded"
              onClick={() => setIsSideBarOpen(true)}
            >
              + Create Group
            </button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "82vh" }}>
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
          )}
        </div>
        {/* Group Chat */}
        <div className="col-span-2 p-3">
          {selectedGroup ? (
            <div
              className="flex flex-col overflow-y-auto"
              style={{ height: "82vh" }}
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

      {isSideBarOpen && (
        <CreateGroupSideBar
          isOpen={isSideBarOpen}
          onClose={() => setIsSideBarOpen(false)}
          customers={customers}
          vendors={vendors}
          loading={loading}
          projectId={projectId}
          onGroupCreate={handleGroupCreate}
        />
      )}
    </div>
  );
};

export default Chats;
