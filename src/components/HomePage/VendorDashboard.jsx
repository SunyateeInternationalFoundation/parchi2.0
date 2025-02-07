import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import man from "../../assets/dashboard/man.png";
import Po from "../../assets/dashboard/Po.png";
import Projects from "../../assets/dashboard/Projects.png";
import Purchase from "../../assets/dashboard/Purchase.png";
import { db } from "../../firebase";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState({
    received: 0,
    pending: 0,
  });

  const userDetails = useSelector((state) => state.users);
  const asVendorDetails = userDetails.userAsOtherCompanies.vendor;
  const [icons, setIcons] = useState([
    {
      name: "Purchases",
      img: Purchase,
      link: "purchase",
      total: 0,
      collectionName: "purchases",
    },
    {
      name: "Purchase-Order",
      img: Po,
      link: "po",
      total: 0,
      collectionName: "po",
    },
    {
      name: "Projects",
      img: Projects,
      link: "projects",
      total: 0,
      collectionName: "projects",
    },
  ]);

  async function fetchCountData() {
    try {
      const asVendorsList = asVendorDetails.map((ele) =>
        doc(db, "vendors", ele.vendorId)
      );
      if (asVendorsList.length === 0) {
        return;
      }

      for (const icon of icons) {
        let count = 0;
        for (const item of asVendorDetails) {
          if (icon.name == "Projects") {
            const projectRef = collection(db, "projects");
            const q = query(
              projectRef,
              where("vendorRef", "array-contains-any", asVendorsList)
            );

            const getData = await getDocs(q);
            count += getData.size;
            continue;
          }

          const ref = collection(
            db,
            "companies",
            item.companyId,
            icon.collectionName
          );
          const q = query(
            ref,
            where(
              "vendorDetails.vendorRef",
              "==",
              doc(db, "vendors", item.vendorId)
            )
          );

          const getData = await getDocs(q);

          getData.docs.forEach((doc) => {
            const { orderStatus, total } = doc.data();
            if (orderStatus == "Received") {
              amount.received += total;
            } else if (orderStatus == "Pending") {
              amount.pending += total;
            }
          });
          count += getData.size;
        }
        icon.total = count;
      }
      setIcons([...icons]);
      setAmount({ ...amount });
    } catch (error) {
      console.log("🚀 ~ fetchDashboardData ~ error:", error);
    }
  }

  useEffect(() => {
    fetchCountData();
  }, []);

  return (
    <div className="flex bg-gray-100 h-full">
      <main className="flex w-full overflow-y-auto">
        <div className="w-full">
          <div className="px-6 py-8">
            <div className=" border rounded-2xl bg-white">
              <div className="flex items-center justify-between border px-6 py-4 rounded-2xl shadow">
                <div className="flex items-center w-3/4 space-x-4">
                  <div className="border rounded-full w-[89px] h-[89px] shadow flex items-center justify-center">
                    {/* {userDetails.companyLogo ? (
                      <img
                        src={userDetails.companyLogo}
                        width="89px"
                        height="89px"
                        className="rounded-full"
                      />
                    ) : ( */}
                    <img
                      src={man}
                      width="89px"
                      height="89px"
                      className="rounded-full"
                    />
                    {/* )} */}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[24px] font-semibold">
                        {userDetails.name}
                      </div>
                      <div className="text-[16px]">{userDetails.address}</div>
                      <div className="text-[16px]">{userDetails.phone}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-around w-full space-x-6">
                  <div className="border-r w-full flex justify-between pe-2">
                    <div>
                      <div className="text-[16px]">Received Amount</div>
                      <div className="text-[24px] font-bold">
                        Rs {amount.received.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="border-r w-full">
                    <div className="border-r w-full flex justify-between pe-2">
                      <div>
                        <div className="text-[16px]">Pending Amount</div>
                        <div className="text-[24px] font-bold">
                          Rs {amount.pending.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-[16px]">Total Amount</div>
                    <div className="text-[24px] font-bold">
                      Rs {(amount.received + amount.pending).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8 pb-2 pt-6">
              {icons.map((item) => (
                <div
                  key={item.name}
                  className="cursor-pointer space-y-1 flex border rounded-lg p-5 hover:shadow-md  bg-white shadow "
                  onClick={() => navigate(item.link)}
                >
                  <div className="flex items-center">
                    <img
                      src={item.img}
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow object-contain w-[70px] h-[70px] "
                    />
                  </div>
                  <div className="ps-5">
                    <div className="text-lg">{item.name}</div>
                    <div className="text-2xl  font-bold ">
                      Total: {item.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
