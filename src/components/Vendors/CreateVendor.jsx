import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db, storage } from "../../firebase";

const CreateVendor = ({ isOpen, onClose, onVendorAdded, vendorData }) => {
  const userDetails = useSelector((state) => state.users);

  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }

  const [isUploading, setIsUploading] = useState(false);

  const [fileName, setFileName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    profileImage: "",
    address: "",
    city: "",
    zipCode: "",
    gstNumber: "",
    panNumber: "",
  });

  useEffect(() => {
    if (vendorData?.id) {
      setFormData(vendorData);
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setFileName(file.name);
      try {
        const storageRef = ref(storage, `profileImages/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setFormData((prevData) => ({
          ...prevData,
          profileImage: downloadURL,
        }));
        setIsUploading(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        setIsUploading(false);
      }
    }
  };
  console.log("vendordata", vendorData);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let vendorsRef = "";
      let vendorLogs = {
        ref: vendorsRef,
        date: serverTimestamp(),
        section: "Vendor",
        action: "Create",
        description: `${formData.name} details created`,
      };
      if (vendorData?.id) {
        const { id, ...rest } = formData;
        const vendorRef = doc(db, "vendors", vendorData.id);
        await updateDoc(vendorRef, rest);
        vendorLogs.action = "Update";
        vendorLogs.description = `${vendorData.name} details updated`;
        vendorLogs.ref = vendorRef;
      } else {
        const ref = await addDoc(collection(db, "vendors"), {
          ...formData,
          companyRef: doc(db, "companies", companyId),
          createdAt: serverTimestamp(),
        });
        vendorLogs.ref = ref;
      }

      await addDoc(collection(db, "companies", companyId, "audit"), vendorLogs);
      setFileName("");
      onClose();
      onVendorAdded();
    } catch (error) {
      console.error("Error saving vendor:", error);
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
        className={`bg-white  pt-2 transform transition-transform  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-xl font-semibold mb-4">
            {vendorData?.id ? "Edit " : "Create "}
            Vendor
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <div className="grid w-full mb-2 items-center gap-1.5">
                <div className=" text-sm text-gray-600">Image</div>
                <label
                  htmlFor="file"
                  className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                >
                  <div className="flex  items-center justify-center gap-1">
                    {fileName ? (
                      <span className="py-1 px-4">{fileName}</span>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 640 512"
                          className="h-8 fill-gray-600"
                        >
                          <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                        </svg>
                        <span className="py-1 px-4">Upload Image</span>
                      </>
                    )}
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-tag w-full"
                placeholder="Name"
                required
              />
            </div>
            <div className="space-y-1">
              <label className=" text-sm  text-gray-600">
                Phone<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="border px-5 py-3  rounded-l-md">+91</span>
                <input
                  type="text"
                  maxLength="10"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border px-5 py-3 w-full rounded-r-md"
                  placeholder="Phone"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Email ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-tag w-full"
                placeholder="Email ID"
              />
            </div>

            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-tag w-full"
                placeholder="Street Address"
              />
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Pin Code"
                className="w-1/2 input-tag w-full"
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-1/2 input-tag w-full"
              />
            </div>

            <div className="space-y-1">
              <label className=" text-sm text-gray-600">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="input-tag w-full"
                placeholder="GST Number"
              />
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="input-tag w-full"
                placeholder="PAN Number"
              />
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {vendorData?.id ? "Edit " : "Create "}
              Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
CreateVendor.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onVendorAdded: PropTypes.func,
};

export default CreateVendor;
