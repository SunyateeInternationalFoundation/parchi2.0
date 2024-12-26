import { doc } from "firebase/firestore";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../../firebase";

const CreateGroupSideBar = ({
  isOpen,
  onClose,
  customers,
  vendors,
  projectId,
  onGroupCreate,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleCheckboxChange = (phoneNumber) => {
    setSelectedMembers((prev) =>
      prev.includes(phoneNumber)
        ? prev.filter((num) => num !== phoneNumber)
        : [...prev, phoneNumber]
    );
  };

  const handleAddMaterial = async () => {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Please select at least one member");
      return;
    }
    const ref = doc(db, "projects", projectId);
    try {
      const newGroup = {
        groupName,
        lastMessage: "",
        memberNums: selectedMembers,
        projectRef: ref,
      };
      onGroupCreate(newGroup);
      onClose();
    } catch (error) {
      console.error("Error adding group:", error);
      alert("Failed to add group. Please try again.");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5">Create Group</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>

        <h3 className="text-lg font-bold mt-4">Customers</h3>
        <ul>
          {customers.map((customer) => (
            <li key={customer.id} className="flex items-center mt-2">
              <input
                type="checkbox"
                id={customer.id}
                className="mr-2"
                onChange={() => handleCheckboxChange(customer.phone)}
              />
              <label htmlFor={customer.id}>
                {customer.name || "Unnamed Customer"} - {customer.phone}
              </label>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-bold mt-4">Vendors</h3>
        <ul>
          {vendors.map((vendor) => (
            <li key={vendor.id} className="flex items-center mt-2">
              <input
                type="checkbox"
                id={vendor.id}
                className="mr-2"
                onChange={() => handleCheckboxChange(vendor.phone)}
              />
              <label htmlFor={vendor.id}>
                {vendor.name || "Unnamed Vendor"} - {vendor.phone}
              </label>
            </li>
          ))}
        </ul>

        <button
          onClick={handleAddMaterial}
          className="w-full bg-blue-700 text-white p-2 rounded-md mt-4"
        >
          + Create Group
        </button>
      </div>
    </div>
  );
};

export default CreateGroupSideBar;
