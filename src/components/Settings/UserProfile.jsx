import { PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, updatePhoneNumber } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth, db, storage } from "../../firebase";
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
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const isVerify = useRef(true);
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

  const configureRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("ReCAPTCHA verified:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },
        }
      );
    }
  };

  const handleVerifyClick = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    if (formData.phone === userDetails.phone) {
      alert("This is your current phone number");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", formData.phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("This phone number is already registered");
        return;
      }
      if (window.recaptchaVerifier) {
        delete window.recaptchaVerifier;
      }
      configureRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const authResult = await signInWithPhoneNumber(
        auth,
        `+91${formData.phone}`,
        appVerifier
      );

      setConfirmationResult(authResult);
      setIsOtpStage(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );
      const currentUser = auth.currentUser;
      if (currentUser) {
        // await linkWithCredential(currentUser, credential);
        await updatePhoneNumber(currentUser, credential);
        alert("Phone number verified successfully!");
        setIsOtpStage(false);

        isVerify.current = true
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
      setOtp("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return;
      }
      if (value == userDetails.phone) {
        isVerify.current = true;
      } else {
        isVerify.current = false;
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
      if (!isVerify.current) {
        alert("Please Verify the Mobile Number");
        return
      }
      const { id, ...payload } = formData;

      await updateDoc(doc(db, "users", userId), {
        ...payload,
        phone_number: `+91${payload.phone}`,
      });
      await addDoc(
        collection(
          db,
          "companies",
          userDetails.companies[userDetails.selectedCompanyIndex].companyId,
          "audit"
        ),
        {
          ref: doc(db, "users", userId),
          date: serverTimestamp(),
          section: "settings",
          action: "Update",
          description: "user profile details updated",
        }
      );
      dispatch(
        updateUserDetails({
          name: payload.displayName,
          phone: payload.phone,
          email: payload.email,
          phone_number: `+91${payload.phone}`,
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
                  className="w-36 h-36 bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded relative object-contain"
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

              <div className="flex">
                <div className="relative w-full">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border px-5 py-3 rounded-l-lg w-full"
                  />
                </div>
                <div className="w-1/5">
                  <button
                    className={`border px-5 py-3 rounded-r-lg font-semibold rounded-e-md w-full  ${isVerify.current ? "bg-gray-100 cursor-not-allowed" : "hover:text-white hover:bg-black cursor-pointer"
                      }`}
                    disabled={isVerify.current}
                    onClick={handleVerifyClick}
                  >
                    {isVerify.current ? "Verified" : "Verify"}
                  </button>
                </div>
              </div>

              {isOtpStage && (
                <div className="flex my-5">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="border px-4 py-2 rounded-md flex-1"
                      maxLength="6"
                    />
                    <button
                      onClick={handleOtpSubmit}
                      className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-md"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}
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
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Prefix;
