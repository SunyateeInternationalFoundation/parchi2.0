import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { setUserLogin } from "../../store/UserSlice";
import CompanyForm from "./CompanyForm";

const LandingPage = () => {
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [userDocRef, setUserDocRef] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResendAllowed, setIsResendAllowed] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isCompanyProfileDone, setIsCompanyProfileDone] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isOtpStage && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsResendAllowed(true);
    }
    return () => clearInterval(timer);
  }, [isOtpStage, countdown]);

  const closeModal = () => {
    setIsOtpStage(false);
    setPhoneNumber("");
    setOtp("");
    document.body.style.overflow = "";
  };

  const handlePhoneNumberChange = (event) => {
    const inputValue = event.target.value;
    const isValidPhoneNumber = /^\d{0,10}$/.test(inputValue);

    if (isValidPhoneNumber) {
      setPhoneNumber(inputValue);
    }
  };

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

  const handlePhoneNumberSubmit = async () => {
    if (phoneNumber) {
      configureRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      try {
        const authResult = await signInWithPhoneNumber(
          auth,
          `+91${phoneNumber}`, // Replace with your country code
          appVerifier
        );
        setConfirmationResult(authResult);
        setIsOtpStage(true);
        setCountdown(60);
        setIsResendAllowed(false);
      } catch (error) {
        console.error("Error during phone number sign-in:", error);
        alert("Failed to send OTP. Please check the number or try again.");
      }
    } else {
      alert("Please enter a valid phone number.");
    }
  };

  const handleOtpSubmit = async () => {
    if (otp && confirmationResult) {
      try {
        const authResult = await confirmationResult.confirm(otp);
        const authUser = authResult.user;
        const token = await authUser.getIdToken();
        let docRef = doc(db, "users", authUser.uid);
        setUserDocRef(docRef);
        const userDoc = await getDoc(docRef);
        let user = {};
        let companiesData = [];
        let asVendorData = [];
        let asCustomerData = [];
        let isCompanyProfileDone = false;
        if (!isLogin) {
          user = {
            uid: authUser.uid,
            displayName: "",
            email: "",
            phone: phoneNumber,
            phone_number: "+91" + phoneNumber,
            photoURL: "",
            createdAt: Timestamp.fromDate(new Date()),
            isCompanyProfileDone: isCompanyProfileDone,
          };
          await setDoc(docRef, user);
          setIsCompanyProfileDone(false);
        } else {
          user = userDoc.data();
          if (!user.isCompanyProfileDone) {
            setIsCompanyProfileDone(false);
            return;
          }
          isCompanyProfileDone = true;
          const companiesRef = collection(db, "companies");
          const q = query(companiesRef, where("userRef", "==", docRef));
          const customersRef = collection(db, "customers");
          const customersQ = query(
            customersRef,
            where("phone", "==", user.phone)
          );
          const vendorsRef = collection(db, "vendors");
          const vendorsQ = query(vendorsRef, where("phone", "==", user.phone));
          const company = await getDocs(q);
          companiesData = company.docs.map((doc) => {
            const { userRef, ...rest } = doc.data();
            return {
              companyId: doc.id,
              ...rest,
            };
          });
          const asCustomer = await getDocs(customersQ);
          asCustomerData = asCustomer.docs.map((doc) => {
            const { companyRef } = doc.data();
            return { companyId: companyRef.id, customerId: doc.id };
          });
          const asVendor = await getDocs(vendorsQ);
          asVendorData = asVendor.docs.map((doc) => {
            const { companyRef } = doc.data();
            return { companyId: companyRef.id, vendorId: doc.id };
          });

          navigate("/invoice");
        }

        const payload = {
          userId: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phone || "",
          companies: companiesData || [],
          isLogin: true,
          selectedCompanyIndex: 0,
          userAsOtherCompanies: {
            customer: asCustomerData,
            vendor: asVendorData,
          },
          token,
          selectedDashboard: "",
          isCompanyProfileDone: isCompanyProfileDone,
        };

        dispatch(setUserLogin(payload));
        alert("OTP verified successfully!");
        closeModal();
      } catch (error) {
        console.log("🚀 ~ handleOtpSubmit ~ error:", error);
        alert("Invalid OTP. Please try again.");
        setOtp("");
      }
    } else {
      alert("Please enter the OTP.");
    }
  };

  const handleResendOtp = async () => {
    if (isResendAllowed) {
      configureRecaptcha();
      try {
        const authResult = await signInWithPhoneNumber(
          auth,
          `+91${phoneNumber}`,
          window.recaptchaVerifier
        );
        setConfirmationResult(authResult);
        setCountdown(60);
        setIsResendAllowed(false);
      } catch (error) {
        console.log("🚀 ~ handleResendOtp ~ error:", error);
        alert("Failed to resend OTP.");
      }
    }
  };

  return (
    <div className="h-screen">
      <nav className="text-white py-3 w-full ">
        <div className="  flex justify-between  items-center px-4">
          <div className="text-2xl font-bold text-blue-600">Sunya</div>
          <div className="space-x-4">
            <button
              className={`px-4 py-2 font-medium rounded-md transition ${
                isLogin
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-600 hover:bg-blue-500 hover:text-white"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-md transition ${
                !isLogin
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-600 hover:bg-blue-500 hover:text-white"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
        </div>
      </nav>
      <div
        className="bg-gray-100 flex justify-center items-center "
        style={{ height: "92vh" }}
      >
        {!isCompanyProfileDone ? (
          <CompanyForm userRef={userDocRef} />
        ) : (
          <div className="max-w-lg w-full h-auto bg-gray-100">
            <div className="shadow-md py-5 w-full  rounded-lg bg-white p-3">
              <div className="text-center mb-3 text-3xl font-bold py-3 text-blue-600">
                Sunya
              </div>
              {/*<div className="flex items-center justify-center text-2xl font-bold my-6">
            Welcome to Sunya
          </div> */}

              <div>
                <div className="h-96 overflow-y-auto">
                  <div>
                    <div className="w-full">
                      <h2 className="text-1xl text-grey-500 mb-2">
                        Enter phone number
                      </h2>
                      <div className="flex items-center mb-4">
                        <span className="px-3 py-2 bg-gray-200 border border-r-0 rounded-l-md text-gray-700">
                          +91
                        </span>
                        <input
                          type="text"
                          maxLength="10"
                          placeholder="Enter your mobile number"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          className="px-4 py-2 border rounded-r-md w-full focus:outline-none"
                          required
                        />
                        {isOtpStage && (
                          <button
                            type="button"
                            className="px-3 py-2 border border-l-0 rounded-r-md text-gray-700"
                            onClick={() => setIsOtpStage(false)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOtpStage && (
                    <div>
                      <h2 className="text-1xl text-grey-500 mb-2">Enter OTP</h2>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="px-4 py-2 border rounded-md w-full mb-4"
                      />
                    </div>
                  )}
                </div>
                {isOtpStage ? (
                  <>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                      onClick={handleOtpSubmit}
                    >
                      Verify OTP
                    </button>

                    <div className="text-sm text-gray-500 mt-3">
                      {countdown > 0
                        ? `You can request another OTP in ${countdown} seconds`
                        : ""}
                    </div>
                    {countdown === 0 && (
                      <button
                        className="mt-2 text-blue-500 underline"
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md w-full mt-4"
                    onClick={handlePhoneNumberSubmit}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LandingPage;
