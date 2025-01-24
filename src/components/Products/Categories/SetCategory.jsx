import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../firebase";

function SetCategory({ isOpen, onClose, onAddCategory, companyId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    img: "",
    tag: "",
  });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Category name is required");
      return;
    }
    setIsLoading(true);

    try {
      const categoryRef = collection(db, "companies", companyId, "categories");
      const newCategory = {
        ...formData,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(categoryRef, newCategory);

      onAddCategory({ id: docRef.id, ...newCategory });
      onClose();
    } catch (error) {
      console.error("Error adding Category:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className=" text-sm text-gray-600 ">Add Category</h2>
          <button
            onClick={onClose}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={handleAddCategory}>
          <div className="space-y-2 p-5" style={{ height: "84vh" }}>
            <div className="grid w-full mb-2 items-center gap-1.5">
              <label
                htmlFor="CategoryName"
                className="block text-gray-700 mb-2"
              >
                Image
              </label>
              <label
                htmlFor="file"
                className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
              >
                <div className="flex  items-center justify-center gap-1">
                  {imageData?.name ? (
                    <span className="py-1 px-4">{imageData?.name}</span>
                  ) : (
                    <>
                      <svg viewBox="0 0 640 512" className="h-8 fill-gray-600">
                        <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                      </svg>
                      <span className="py-1 px-4">Upload Image</span>
                    </>
                  )}
                </div>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setImageData(e.target.files[0])}
                />
              </label>
            </div>
            <div className="mb-4">
              <label
                htmlFor="CategoryName"
                className="block text-gray-700 mb-2"
              >
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                className="w-full input-tag"
                value={formData.name}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, name: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="CategoryName"
                className="block text-gray-700 mb-2"
              >
                Tag
              </label>
              <input
                id="categoryName"
                type="text"
                className="w-full input-tag"
                value={formData.tag}
                onChange={(e) => setFormData(e.target.value)}
              />
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {isLoading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetCategory;
