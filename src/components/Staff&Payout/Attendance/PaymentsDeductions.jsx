import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

function PaymentsDeductions({ onClose, staff, addPaymentDeductionToStaff }) {
  const [selectedShift, setSelectedShift] = useState(1);
  const [selectedTiming, setSelectedTiming] = useState({
    type: "",
    hours: 0,
    amount: 0,
  });
  const [selectedAllowance, setSelectedAllowance] = useState({
    type: "",
    hours: 0,
    amount: 0,
  });

  useEffect(() => {
    setSelectedShift(staff.shift);
    if (!staff?.adjustments) {
      return;
    }
    if (staff?.adjustments?.overTime) {
      setSelectedTiming({
        type: "overTime",
        hours: staff.adjustments?.overTime.hours,
        amount: staff.adjustments?.overTime.amount,
      });
    }
    if (staff?.adjustments?.lateFine) {
      setSelectedTiming({
        type: "lateFine",
        hours: staff.adjustments?.lateFine.hours,
        amount: staff.adjustments?.lateFine.amount,
      });
    }
    if (staff?.adjustments?.allowance) {
      setSelectedAllowance({
        type: "allowance",
        hours: staff.adjustments?.allowance.hours,
        amount: staff.adjustments?.allowance.amount,
      });
    }
    if (staff?.adjustments?.deduction) {
      setSelectedAllowance({
        type: "deduction",
        hours: staff.adjustments?.deduction.hours,
        amount: staff.adjustments?.deduction.amount,
      });
    }
  }, [staff]);

  function onReset() {
    setSelectedShift(1);
    setSelectedTiming({
      type: "",
      hours: 0,
      amount: 0,
    });
    setSelectedAllowance({
      type: "",
      hours: 0,
      amount: 0,
    });
  }

  function onSubmit() {
    let payload = {
      shift: selectedShift,
      adjustments: {},
    };

    if (selectedAllowance.type !== "") {
      payload.adjustments[selectedAllowance.type] = {
        hours: selectedAllowance.hours,
        amount: selectedAllowance.amount,
      };
    }
    if (selectedTiming.type !== "") {
      payload.adjustments[selectedTiming.type] = {
        hours: selectedTiming.hours,
        amount: selectedTiming.amount,
      };
    }
    addPaymentDeductionToStaff(staff.id, payload);
    onReset();
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-100 flex justify-end bg-black bg-opacity-25 transition-opacity ${staff.id ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      onClick={() => {
        onClose();
        onReset();
      }}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform min-h-screen ${staff.id ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="font-bold text-xl"> Payments & Deductions</h2>
          <button
            className="text-2xl"
            onClick={() => {
              onClose();
              onReset();
            }}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="font-semibold my-2 px-5">{staff.name}</div>
        <div className=" my-2 px-5"> Amount Calculation</div>
        <div>
          <div className="overflow-y-auto px-5" style={{ height: "77vh" }}>
            <div>
              <label className="text-sm block font-semibold mt-2">Shift</label>
              <div className="flex">
                {[0.5, 1, 1.5, 2].map((shift) => (
                  <div key={shift} className="flex-grow text-center">
                    <input
                      type="radio"
                      name="shift"
                      id={shift}
                      value={shift}
                      className="hidden"
                      onChange={(e) => setSelectedShift(+e.target.value)}
                    />
                    <label
                      htmlFor={shift}
                      className={`inline-block px-5 py-2 cursor-pointer border rounded-lg transition-all ease-in-out text-sm m-1 shadow-md ${selectedShift === shift
                        ? "border-blue-700  bg-blue-700 text-white "
                        : "bg-white text-blue-900 border-blue-700"
                        }`}
                    >
                      {shift} Shift
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="my-3">
              <div className="flex">
                {["overTime", "lateFine"].map((time) => (
                  <div key={time} className="flex-grow text-center">
                    <input
                      type="radio"
                      name="time"
                      id={time}
                      value={time}
                      className="hidden"
                      onChange={(e) =>
                        setSelectedTiming((val) => ({
                          ...val,
                          type: e.target.value,
                        }))
                      }
                    />
                    <label
                      htmlFor={time}
                      className={`inline-block px-5 py-2 cursor-pointer border rounded-lg transition-all ease-in-out text-sm m-1 shadow-md  border-green-700 ${selectedTiming.type === time
                        ? "bg-green-700 text-white "
                        : "bg-white text-green-900 "
                        }`}
                    >
                      {time.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex w-full my-2">
                <input
                  type="number"
                  placeholder="Hours"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none "
                  value={selectedTiming.hours || ""}
                  onChange={(e) =>
                    setSelectedTiming((val) => ({
                      ...val,
                      hours: +e.target.value,
                    }))
                  }
                />
                <p className="font-semibold m-2">X</p>
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none "
                  value={selectedTiming.amount || ""}
                  onChange={(e) =>
                    setSelectedTiming((val) => ({
                      ...val,
                      amount: +e.target.value,
                    }))
                  }
                />
                <p className="font-bold m-2">=</p>
                <div
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none ">{selectedTiming.amount * selectedTiming.hours}
                </div>
              </div>
            </div>
            <div className="my-3">
              <div className="flex">
                {["allowance", "deduction"].map((items) => (
                  <div key={items} className="flex-grow text-center">
                    <input
                      type="radio"
                      name="all-ded"
                      id={items}
                      value={items}
                      className="hidden"
                      onChange={(e) =>
                        setSelectedAllowance((val) => ({
                          ...val,
                          type: e.target.value,
                        }))
                      }
                    />
                    <label
                      htmlFor={items}
                      className={`inline-block px-5 py-2 border-green-700  cursor-pointer border rounded-lg transition-all ease-in-out text-sm m-1 shadow-md ${selectedAllowance.type === items
                        ? " bg-green-700 text-white "
                        : "bg-white text-green-900 "
                        }`}
                    >
                      {items.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex w-full my-2">
                <input
                  type="number"
                  placeholder="Hours"
                  value={selectedAllowance.hours || ""}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none "
                  onChange={(e) =>
                    setSelectedAllowance((val) => ({
                      ...val,
                      hours: +e.target.value,
                    }))
                  }
                />
                <p className="font-semibold m-2">X</p>
                <input
                  type="number"
                  placeholder="Amount"
                  value={selectedAllowance.amount || ""}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none "
                  onChange={(e) =>
                    setSelectedAllowance((val) => ({
                      ...val,
                      amount: +e.target.value,
                    }))
                  }
                />
                <p className="font-bold m-2">=</p>
                <div className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none "
                >{selectedAllowance.amount * selectedAllowance.hours}
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "8vh" }}
          >
            <button className="w-full btn-add" onClick={onSubmit}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentsDeductions;
