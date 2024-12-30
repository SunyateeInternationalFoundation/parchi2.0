import { doc, getDoc } from "firebase/firestore";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useRef, useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import { db } from "../../firebase";

const BusinessCard = () => {
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    tagline: "",
    address: "",
    city: "",
    zipCode: "",
    about: "",
    socialLinks: { facebook: "", twitter: "", instagram: "" },
    companyLogo: "",
  });

  const cardRef = useRef(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const companyDocRef = doc(db, "companies", companyId);
        const companySnapshot = await getDoc(companyDocRef);

        if (companySnapshot.exists()) {
          const companyData = {
            id: companySnapshot.id,
            ...companySnapshot.data(),
          };
          setFormData(companyData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  const downloadCard = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        const doc = new jsPDF();

        doc.addImage(imgData, "PNG", 10, 10, 90, 40);

        doc.save("business_card.pdf");
      });
    }
  };

  return (
    <div>
      <div className="flex justify-end mt-4 mr-4">
        <button
          onClick={downloadCard}
          className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download Business Card as PDF
        </button>
      </div>
      <div
        ref={cardRef}
        className="max-w-6xl h-[400px] mx-auto bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col md:flex-row border-l-4 border-blue-900 mt-16"
      >
        <div className="w-full md:w-1/3 bg-gray-100 p-6 flex flex-col items-center justify-center">
          {formData.companyLogo && (
            <img
              src={formData.companyLogo}
              alt="Company Logo"
              className="w-64 h-64 rounded-full mb-4 border-4 border-gray-300 shadow-lg"
            />
          )}
        </div>

        <div className="w-full md:w-2/3 p-6 flex flex-col justify-between relative">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {formData.name}
            </h1>
            <p className="text-lg text-gray-500 italic">{formData.tagline}</p>
          </div>
          <div className="text-lg text-gray-500 italic mt-6">
            "Dedicated to providing value-driven services, we prioritize client
            satisfaction and measurable results."
          </div>

          <div className="space-y-3 text-gray-700 mt-6">
            {formData.phone && (
              <p className="flex items-center">
                <FaPhone className="text-blue-900 mr-2" />
                {formData.phone}
              </p>
            )}
            {formData.email && (
              <p className="flex items-center">
                <FaEnvelope className="text-blue-900 mr-2" />
                <a
                  href={`mailto:${formData.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {formData.email}
                </a>
              </p>
            )}
            {formData.website && (
              <p className="flex items-center">
                <FaGlobe className="text-blue-900 mr-2" />
                <a
                  href={formData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formData.website}
                </a>
              </p>
            )}
            {formData.address && (
              <p className="flex items-center">
                <FaMapMarkerAlt className="text-blue-900 mr-2" />
                {`${formData.address}, ${formData.city}, ${formData.zipCode}`}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            {/* {formData.socialLinks.facebook && ( */}
            <a
              href={formData?.socialLinks?.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900"
            >
              <FaFacebookF className="text-2xl" />
            </a>
            {/* )} */}
            {/* {formData.socialLinks.twitter && ( */}
            <a
              href={formData?.socialLinks?.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
            >
              <FaTwitter className="text-2xl" />
            </a>
            {/* )}
            {formData.socialLinks.instagram && ( */}
            <a
              href={formData?.socialLinks?.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
            >
              <FaInstagram className="text-2xl" />
            </a>
            {/* )} */}
          </div>

          <div className="absolute bottom-20 right-20">
            <QRCode value={formData.website || ""} size={140} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
