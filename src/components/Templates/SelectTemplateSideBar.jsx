import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import template1 from "../../assets/templates/template1.png";
import template2 from "../../assets/templates/template2.png";
import template3 from "../../assets/templates/template3.png";
import template4 from "../../assets/templates/template4.png";
import template5 from "../../assets/templates/template5.png";
import template6 from "../../assets/templates/template6.png";
import template7 from "../../assets/templates/template7.png";
import template8 from "../../assets/templates/template8.png";
import template9 from "../../assets/templates/template9.png";
import template10 from "../../assets/templates/template10.png";
import template11 from "../../assets/templates/template11.png";
function SelectTemplateSideBar({
  isOpen,
  onClose,
  onSelectedTemplate,
  preSelectedTemplate,
}) {
  const [selectTemplate, setSelectTemplate] = useState(preSelectedTemplate);
  const templatesImg = [
    { id: "template1", img: template1 },
    { id: "template2", img: template2 },
    { id: "template3", img: template3 },
    { id: "template4", img: template4 },
    { id: "template5", img: template5 },
    { id: "template6", img: template6 },
    { id: "template7", img: template7 },
    { id: "template8", img: template8 },
    { id: "template9", img: template9 },
    { id: "template10", img: template10 },
    { id: "template11", img: template11 },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        onClose();
        setSelectTemplate(preSelectedTemplate);
      }}
    >
      <div
        className={`bg-white w-1/2 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
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
                  "relative  h-60 overflow-hidden hover:shadow-xl transition duration-200 ease-in-out rounded-lg" +
                  (selectTemplate === template.id
                    ? " border-2 shadow-xl border-blue-500"
                    : "")
                }
                key={template.id}
                onClick={() => setSelectTemplate(template.id)}
              >
                <img
                  src={template.img}
                  alt="template"
                  className="object-cover border-2 rounded-lg cursor-pointer  w-full items-center  h-60 "
                />
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

export default SelectTemplateSideBar;
