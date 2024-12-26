import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

function SideBarAddServices({
  onClose,
  isOpen,
  servicesList,
  onSubmitService,
}) {
  const [Services, setServices] = useState(servicesList);
  const [searchTerm, setSearchTerm] = useState("");
  const modifiedServices = servicesList.filter((ele) =>
    ele.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setServices(servicesList);
  }, [servicesList]);

  function onSelectService(id) {
    const updatedData = servicesList.map((ele) => {
      if (ele.id === id) {
        ele.isSelected = !ele.isSelected;
      }
      return ele;
    });
    setServices(updatedData);
  }

  function onSubmit() {
    const payload = Services.filter((ele) => ele.isSelected).map((ele) => {
      const { isSelected, ...rest } = ele;
      return rest;
    });
    onSubmitService(payload);
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold ">Add Service</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <div className="mt-5 space-y-3 ">
          <div className="border p-1 rounded-lg w-full mt-1 flex items-center ">
            <input
              type="text"
              className="w-full py-2 focus:outline-none"
              placeholder="Search Services"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IoSearch size={25} />
          </div>
          <div className="overflow-y-auto" style={{ height: "70vh" }}>
            {modifiedServices.map((service) => (
              <div
                key={service.id}
                className={
                  "border-2 shadow rounded-lg px-4 py-2 flex justify-between my-2  " +
                  (service.isSelected ? "bg-blue-400" : "")
                }
                onClick={() => onSelectService(service.id)}
              >
                <div className="">
                  <div className="font-bold">{service.serviceName}</div>
                </div>
                <div className="text-end">
                  <div className="font-bold">
                    ₹ {service.unitPrice.toFixed(1)}
                  </div>
                  <div className="text-sm">Discount : {service.discount}</div>
                  <div className="text-sm"> Tax ₹ {service.taxSlab}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          className="w-full bg-purple-500 text-white p-2 rounded-md mt-4"
          onClick={onSubmit}
        >
          Add Service
        </button>
      </div>
    </div>
  );
}

export default SideBarAddServices;
