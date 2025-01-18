import { addDoc, collection, updateDoc } from "firebase/firestore";
import PropTypes from "prop-types";
import { useState } from "react";
import { FaIndustry, FaSchool, FaTruck, FaUser } from "react-icons/fa";
import {
  MdEmail,
  MdOutlineBusinessCenter,
  MdOutlineHotel,
  MdOutlineLocalPhone,
  MdOutlineLocationOn,
  MdOutlineRestaurant,
  MdOutlineShoppingBag,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { setCompanyData } from "../../store/UserSlice";

const CompanyForm = ({ userRef }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [isActive, setIsActive] = useState("user");
  const businessOptions = [
    { id: "retail", name: "Retail", icon: <MdOutlineShoppingBag size={24} /> },
    { id: "hotel", name: "Manufacturer", icon: <MdOutlineHotel size={24} /> },
    {
      id: "restaurant",
      name: "Restaurant",
      icon: <MdOutlineRestaurant size={24} />,
    },
    { id: "transport", name: "Distributor", icon: <FaTruck size={24} /> },
    { id: "industry", name: "Industry", icon: <FaIndustry size={24} /> },
    { id: "education", name: "Education", icon: <FaSchool size={24} /> },
    {
      id: "corporate",
      name: "Information Technology",
      icon: <MdOutlineBusinessCenter size={24} />,
    },
  ];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(e) {
    if (!formData.name || !formData.nature) {
      formData.name = "Your Company";
      formData.nature = "Others";
    }
    e.preventDefault();
    try {
      const companyRef = await addDoc(collection(db, "companies"), {
        ...formData,
        userRef,
      });
      await updateDoc(userRef, {
        isCompanyProfileDone: true,
      });
      alert("Successfully Created!");
      dispatch(
        setCompanyData({
          companyId: companyRef.id,
          ...formData,
          isCompanyProfileDone: true,
        })
      );
      navigate("/invoice");
    } catch (error) {
      console.log("🚀 ~ Submit ~ error:", error);
    }
  }
  function handleSelectBusinessNature(id) {
    setFormData((prev) => ({ ...prev, nature: id }));
  }

  function handleChangeInput(e) {
    const { name, value } = e.target;
    setFormData((val) => ({ ...val, [name]: value }));
  }

  return (
    <div className="shadow-md py-5 w-full md:w-1/2 h-auto rounded-lg bg-white p-5 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div
          className={`flex-1 border-t-2 ${
            isActive === "user" || isActive === "company"
              ? "border-green-500"
              : "border-gray-300"
          }`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isActive === "user" || isActive === "company"
              ? "bg-green-500 text-white"
              : "border-2 border-gray-300 text-gray-500"
          }`}
        >
          1
        </div>
        <div
          className={`flex-1 border-t-2 ${
            isActive === "company" ? "border-green-500" : "border-gray-300"
          }`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isActive === "company"
              ? "bg-green-500 text-white"
              : "border-2 border-gray-300 text-gray-500"
          }`}
        >
          2
        </div>
      </div>
      {isActive === "user" && (
        <>
          <h1 className="text-2xl font-semibold mb-6 text-gray-700 text-center">
            Select Business Nature
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {businessOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg ${
                  formData.nature === option.id
                    ? "border-blue-600 bg-blue-100"
                    : "border-gray-300"
                } hover:shadow-md`}
                onClick={() => handleSelectBusinessNature(option.id)}
              >
                <div className="text-blue-600">{option.icon}</div>
                <span className="mt-2 text-sm font-medium">{option.name}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="text-blue-600 px-4 py-2 rounded-md hover:underline"
              onClick={() => setIsActive("company")}
            >
              Skip for Now
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                formData.nature
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => setIsActive("company")}
              disabled={!formData.nature}
            >
              Next
            </button>
          </div>
        </>
      )}

      {isActive === "company" && (
        <>
          <h1 className="text-2xl font-semibold mb-6 text-gray-700 text-center">
            Company Details
          </h1>
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block font-medium mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaUser />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter company name"
                  className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:ring focus:ring-blue-300"
                  onChange={handleChangeInput}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2">Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MdOutlineLocationOn />
                </span>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:ring focus:ring-blue-300"
                  onChange={handleChangeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdOutlineLocalPhone />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:ring focus:ring-blue-300"
                    onChange={handleChangeInput}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdEmail />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:ring focus:ring-blue-300"
                    onChange={handleChangeInput}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">
                  GST Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdOutlineLocalPhone />
                  </span>
                  <input
                    type="text"
                    name="gst"
                    placeholder="Enter GST number"
                    className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:ring focus:ring-blue-300"
                    onChange={handleChangeInput}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">PAN Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdEmail />
                  </span>
                  <input
                    type="text"
                    name="text"
                    placeholder="Enter PAN Number 'AIZKBC1230A'"
                    className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:ring focus:ring-blue-300"
                    onChange={handleChangeInput}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                className="text-blue-600 px-4 py-2 rounded-md hover:underline"
                onClick={onSubmit}
              >
                Skip for Now
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={onSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
CompanyForm.propTypes = {
  userRef: PropTypes.object.isRequired,
};

export default CompanyForm;
