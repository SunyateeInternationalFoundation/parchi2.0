import React, { useState, useEffect } from "react";
import SettingsView from "./SettingView";
import { FaUser } from "react-icons/fa";
import { MdOutlineLocalPhone } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { db, storage } from "../../firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { updateUserDetails } from "../../store/UserSlice";
const Prefix = () => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.users);

  const userId = userDetails.userId;
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    photoURL: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = {
            id: userSnapshot.id,
            ...userSnapshot.data(),
          };
          setFormData(userData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      const storageRef = ref(storage, `logos/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Error uploading file:", error);
          alert("Failed to upload file.");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData((prevData) => ({
            ...prevData,
            userLogo: downloadURL,
          }));
          alert("File uploaded successfully!");
        }
      );
    } catch (e) {
      console.error("Error during file upload:", e);
      alert("Failed to upload the file.");
    }
  };

  const handleSave = async () => {
    try {
      const { id, ...payload } = formData;
      await updateDoc(doc(db, "users", userId), payload);
      dispatch(
        updateUserDetails({
          name: payload.displayName,
          phone: payload.phone,
          email: payload.email,
        })
      );
      alert("Details saved successfully! ");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Failed to save details.");
    }
  };

  return (
    <div className="flex">
      {/* <div className="w-1/4">
        {" "}
        <SettingsView />
      </div> */}
      <div className="p-6 bg-gray-100 w-full max-h-screen overflow-y-auto mt-4">
        <div className="mx-auto bg-white shadow-md rounded-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-700">
              User Details
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-36 h-36 bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded relative hover:border-blue-500">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt="Profile"
                  className="w-36 h-36 bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded relative object-cover"
                />
              ) : (
                <label
                  htmlFor="image-upload"
                  className="absolute inset-0 flex items-center justify-center cursor-pointer text-gray-500 text-sm"
                >
                  Upload
                </label>
              )}

              <input
                id="image-upload"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="photoURL/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  handleFileUpload(file);
                }}
              />
            </div>
          </div>

          <div className="space-y-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Name
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
                  <FaUser />
                </span>
                <input
                  type="text"
                  name="displayName"
                  placeholder="Name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500  hover:border-blue-500 hover:shadow-md hover:shadow-blue-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
                  <MdOutlineLocalPhone />
                </span>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
                  <MdEmail />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500  hover:border-blue-500 hover:shadow-md hover:shadow-blue-300"
                />
              </div>
            </div>
          </div>

          <div className="text-right mt-5">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
              onClick={handleSave}
            >
              Save & Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prefix;
