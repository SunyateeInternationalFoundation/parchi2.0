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
import { FaStar } from "react-icons/fa";
import { ImQuotesLeft } from "react-icons/im";
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
      if (!isLogin) {
        const userRef = collection(db, "users");
        const q = query(userRef, where("phone", "==", phoneNumber));
        const userData = await getDocs(q);
        if (userData.docs.length != 0) {
          setIsLogin(true);
        } else {
          setIsLogin(false);
        }
      }
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
        setCountdown;
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
            const { userRef, createdAt, ...rest } = doc.data();
            return {
              companyId: doc.id,
              ...rest,
              createdAt: JSON.stringify(createdAt)
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

          navigate("/");
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
  console.log("confirmation result", confirmationResult);
  return (
    <div className="h-screen">
      {/* <nav className="text-white py-3 w-full ">
        <div className="  flex justify-between  items-center px-4">
          <div className="text-2xl font-bold text-blue-600">Sunya</div>
        </div>
      </nav> */}
      <div
        className="bg-gray-100 flex justify-center items-center h-screen "
      >
        {!isCompanyProfileDone ? (
          <CompanyForm userRef={userDocRef} />
        ) : (


          <div className=" bg-[hsl(250,92%,70%)]  flex  justify-center items-center h-screen w-full">
            <div className="flex flex-col gap-4 justify-center bg-white my-10 p-10 2xl:my-20 m-4 w-fit overflow-hidden xl:w-[calc(100vw-80px)]   2xl:w-[calc(100vw-160px)]  2xl:px-20 2xl:py-12 rounded-3xl  
    ">
              <div className="relative  rounded-xl">
                <div className="flex flex-col xl:flex-row items-center w-full gap-y-12">
                  <div className="basis-full xl:basis-1/2 w-full">
                    <div className="w-full  xl:w-[480px]  relative z-20">
                      <div className="max-w-lg w-full h-auto ">
                        <div className="py-5 w-full  rounded-lg  p-3">
                          <div className="text-center mb-3 text-3xl font-bold py-3 text-[hsl(250,92%,70%)]">
                            Sunya
                          </div>
                          <div className=" text-2xl font-bold my-6">
                            Welcome to Sunya
                          </div>

                          <div>
                            <div className="h-96 overflow-y-auto">
                              <div>
                                <div className="w-full">
                                  <h2 className="text-1xl text-grey-500 mb-2">
                                    Phone
                                  </h2>
                                  <div className="flex items-center mb-4">
                                    <span className="px-3 py-3 border border-r-0 rounded-l-md text-gray-700">
                                      +91
                                    </span>
                                    <input
                                      type="text"
                                      maxLength="10"
                                      placeholder="Enter your Phone number"
                                      value={phoneNumber}
                                      onChange={handlePhoneNumberChange}
                                      className="px-4 py-3 border rounded-r-md w-full focus:outline-none"
                                      required
                                    />
                                    {isOtpStage && (
                                      <button
                                        type="button"
                                        className="px-3 py-3 border border-l-0 rounded-r-md text-gray-700"
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
                                  className="bg-[hsl(250,92%,70%)] text-white px-4 py-2 rounded-md w-full"
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
                                className="bg-[hsl(250,92%,70%)] text-white px-4 py-3 rounded-md w-full mt-4"
                                onClick={handlePhoneNumberSubmit}
                              >
                                Submit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="basis-full xl:basis-1/2 hidden xl:block relative w-[500px] ">
                    <svg
                      className="absolute top-0 -right-0 "
                      width="1008" height="580" viewBox="0 0 1208 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_f_4801_13605)">
                        <circle cx="604" cy="565" r="404" fill="url(#paint0_radial_4801_13605)" />
                      </g>
                      <defs>
                        <filter id="filter0_f_4801_13605" x="0" y="-39" width="1208" height="1208" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                          <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_4801_13605" />
                        </filter>
                        <radialGradient id="paint0_radial_4801_13605" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(805.322 373.168) rotate(134.675) scale(1098.13)">
                          <stop stopColor="#826AF9" stopOpacity="0.6" />
                          <stop offset="1" stopColor="#826AF9" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    <div className="bg-[hsl(250,92%,70%)] h-full w-full rounded-3xl rounded-tr-none  xl:p-[40px] ltr:xl:pr-10 rtl:xl:pl-14 relative  overflow-hidden">
                      <svg
                        className="absolute -top-[25px] -right-6 hidden lg:block [&>*]:fill-background"
                        width="209"
                        height="162"
                        viewBox="0 0 209 162"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M62 25H0V0H209V162H185C184.317 129.162 169.576 122.271 158.235 120.921H121.512C100.402 119.676 90.7287 104.351 90.7287 93.7286V57.8571C89.4326 35.64 71.0009 26.7357 62 25Z"
                          fill="white"
                        />
                      </svg>

                      <div className="text-2xl lg:text-3xl xl:text-5xl font-semibold text-white rtl:pr-18">
                        What’s Our <span className="xl:block"></span>
                        Clients Say...
                      </div>

                      <div className="text-xl  mt-2 text-white flex gap-1">
                        <span className="text-lg">
                          <ImQuotesLeft />
                        </span>
                        DashTail is awesome friendly Admin Dashboard Template. If you
                        manage your business in online then “DashTail” is for you. Buy
                        Now & make user friendly your business today...
                      </div>

                      <div className=" bg-white overflow-hidden w-full  rounded-3xl rounded-tr-none  relative mt-11 pt-8 pb-7 pl-4">
                        <div className="h-[72px] w-[72px] rounded-full  bg-white flex justify-center items-center absolute right-0 top-0 z-10">

                          <div className="text-[40px] text-yellow-400"><FaStar /> </div>
                        </div>
                        <svg
                          className="absolute -top-[25px] -right-6 [&>*]:fill-primary"
                          width="209"
                          height="162"
                          viewBox="0 0 209 162"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M62 25H0V0H209V162H185C184.317 129.162 169.576 122.271 158.235 120.921H121.512C100.402 119.676 90.7287 104.351 90.7287 93.7286V57.8571C89.4326 35.64 71.0009 26.7357 62 25Z"
                            fill="hsl(250,92%,70%)"
                          />
                        </svg>
                        <div className="w-[90%] mx-auto">
                          <div
                            className="w-full h-full rounded-2xl "
                          >
                            <div>
                              <div className="ltr:pl-4 rtl:pr-8 pb-10">
                                <div className="text-lg lg:text-xl  font-semibold text-default-900 pr-10">
                                  Prantik Chakraborty <br />
                                  <span className="text-base font-medium text-default-700">
                                    {" "}
                                    UI/UX Designer at Codeshaper
                                  </span>
                                </div>
                                <div className="text-lg  text-default-800 mt-4">
                                  The key metric of whether you've succeeded is what
                                  fraction of your employees use that dashboard
                                  everyday.
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
