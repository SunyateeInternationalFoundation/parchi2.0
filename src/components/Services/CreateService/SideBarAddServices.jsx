import PropTypes from "prop-types";
import { useEffect, useState } from "react";
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
        className={`bg-white  pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className=" text-sm text-gray-600 ">Add Service</h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="mt-5 space-y-3  ">
          <div className="px-5 ">
            <div className="border p-1 rounded-lg w-full  flex items-center ">
              <input
                type="text"
                className="w-full py-2 focus:outline-none"
                placeholder="Search Services"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearch size={25} />
            </div>
          </div>
          <div className="overflow-y-auto px-5" style={{ height: "74vh" }}>
            {modifiedServices.map((service) => (
              <div
                key={service.id}
                className={
                  "border-2 shadow rounded-lg px-4 py-2 flex justify-between my-2  " +
                  (service.isSelected ? "bg-blue-400" : "")
                }
                onClick={() => onSelectService(service.id)}
              >
                <div>
                  <div className="font-bold">{service.serviceName}</div>
                </div>
                <div className="text-end">
                  <div className="font-bold">
                    ₹ {service.sellingPrice?.toFixed(1)}
                  </div>
                  <div className="text-sm">
                    Discount : {service.discount}{" "}
                    {service.discountType ? "%" : "/-"}
                  </div>
                  <div className="text-sm"> Tax ₹ {service.tax}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
          style={{ height: "6vh" }}
        >
          <button className="btn-add w-full" onClick={onSubmit}>
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
}
SideBarAddServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  servicesList: PropTypes.array,
  onSubmitService: PropTypes.func.isRequired,
};

export default SideBarAddServices;
