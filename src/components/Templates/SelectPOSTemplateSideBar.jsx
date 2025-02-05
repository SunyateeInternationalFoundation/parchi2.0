import PropTypes from "prop-types";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import posTemplate from "../../assets/templates/posTemplate.png";
function SelectPOSTemplateSideBar({
  isOpen,
  onClose,
  onSelectedTemplate,
  preSelectedTemplate,
}) {
  const [selectTemplate, setSelectTemplate] = useState(preSelectedTemplate);
  const templatesImg = [
    { id: "template2In", img: posTemplate, name: "2 Inch" },
    { id: "template3In", img: posTemplate, name: "3 Inch" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      onClick={() => {
        onClose();
        setSelectTemplate(preSelectedTemplate);
      }}
    >
      <div
        className={`bg-white w-1/2 p-3 pt-2 transform transition-transform overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold ">Change Template</h2>
        <button
          onClick={() => {
            onClose();
            setSelectTemplate(preSelectedTemplate);
          }}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <div>
          <div
            className="grid grid-cols-3 gap-4  mt-4 overflow-y-auto"
            style={{ height: "75vh" }}
          >
            {templatesImg.map((template) => (
              <div
                className={
                  "relative  h-72 overflow-hidden hover:shadow-xl transition duration-200 ease-in-out rounded-lg border-2 " +
                  (selectTemplate === template.id
                    ? " border-2 shadow-xl border-blue-500"
                    : "")
                }
                key={template.id}
                onClick={() => setSelectTemplate(template.id)}
              >
                <div className=" ">
                  <img
                    src={template.img}
                    alt="template"
                    className="object-cover rounded-lg cursor-pointer  w-full items-center  h-64 "
                  />
                </div>
                <div className="border-t text-center">{template.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <button
            className="w-full bg-blue-500 p-2 rounded-lg mt-10 text-white"
            onClick={() => onSelectedTemplate(selectTemplate)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
SelectPOSTemplateSideBar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectedTemplate: PropTypes.func.isRequired,
  preSelectedTemplate: PropTypes.string,
};

export default SelectPOSTemplateSideBar;
