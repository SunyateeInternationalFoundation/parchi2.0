import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db, storage } from "../../firebase";
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
    <div className="main-container">
      <h1 className="text-2xl font-bold text-gray-800 px-5">Settings</h1>

      <div className="container2">
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
              <label className=" text-sm space-y-1 text-gray-600">Name</label>

              <div>
                <input
                  type="text"
                  name="displayName"
                  placeholder="Name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="input-tag w-full"
                />
              </div>
            </div>
            <div>
              <label className=" text-sm space-y-1 text-gray-600">
                Phone Number
              </label>
              <div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-tag w-full"
                />
              </div>
            </div>
            <div>
              <label className=" text-sm space-y-1 text-gray-600">Email</label>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-tag w-full"
                />
              </div>
            </div>
          </div>

          <div className="text-right mt-5">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 font-semibold rounded-md"
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
