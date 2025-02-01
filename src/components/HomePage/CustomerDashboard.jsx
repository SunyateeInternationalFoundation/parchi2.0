import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import man from "../../assets/dashboard/man.png";

const CustomerDashboard = ({ amount, icons }) => {
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.users);

  return (
    <div className="flex bg-gray-100 h-full">
      <main className="flex w-full overflow-y-auto">
        <div className="w-full">
          <div className="px-6 py-8">
            <div className=" border rounded-2xl bg-white">
              <div className="flex items-center justify-between border px-6 py-4 rounded-2xl shadow">
                <div className="flex items-center w-3/4 space-x-4 ">
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
                      className="rounded-full object-cover w-[89px] h-[89px]"
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
                      <div className="text-[16px]">Paid Amount</div>
                      <div className="text-[24px] font-bold">
                        Rs {amount.paid.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="border-r w-full">
                    <div className="border-r w-full flex justify-between pe-2">
                      <div>
                        <div className="text-[16px]">UnPaid Amount</div>
                        <div className="text-[24px] font-bold">
                          Rs {amount.unPaid.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-[16px]">Pending Amount</div>
                    <div className="text-[24px] font-bold">
                      Rs {amount.pending.toFixed(1)}
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
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow object-cover w-[70px] h-[70px] "
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

export default CustomerDashboard;
