import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState({
    total: 0,
  });

  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchCategories = async () => {
    const categoriesRef = collection(
      db,
      "companies",
      companyDetails.companyId,
      "categories"
    );
    const snapshot = await getDocs(categoriesRef);

    const categoriesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCategories(categoriesData);
    setCategoriesCount({
      total: categoriesData.length,
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
    setCategoriesCount((prev) => ({
      total: prev.total + 1,
    }));
  };

  async function OnDeleteCategory(e, categoryId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this category?"
      );
      if (!confirm) return;

      await deleteDoc(
        doc(db, "companies", companyDetails.companyId, "categories", categoryId)
      );

      setCategories((prev) => {
        const updatedCategories = prev.filter((cat) => cat.id !== categoryId);

        setCategoriesCount({ total: updatedCategories.length });

        return updatedCategories;
      });
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  }
  return (
    <div className=" p-5">
      <div className="bg-white py-5 rounded-lg  shadow-md">
        <div className="flex justify-between items-center px-5">
          <h1 className="text-2xl font-semibold">Categories</h1>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
          >
            + Create Category
          </button>
        </div>
        <div
          className=" rounded-lg py-3 overflow-y-auto"
          style={{ height: "65vh" }}
        >
          <table className="w-full border-collapse text-start  ">
            <thead className=" bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  Date
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Name
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Delete
                </td>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="border-b-2 border-gray-200 ">
                    <td className="px-8 py-3 text-start ">
                      <FormatTimestamp timestamp={category.createdAt} />
                    </td>
                    <td className="px-5 py-3 text-start">{category.name}</td>

                    <td
                      className="px-5 py-3 text-start text-red-700 text-2xl"
                      onClick={(e) => {
                        e.preventDefault();
                        OnDeleteCategory(e, category.id);
                      }}
                    >
                      <IoMdTrash />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="h-24 text-center py-4 ">
                    No Item Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className="space-y-4 mt-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            setCategories={setCategories}
            setCategoriesCount={setCategoriesCount}
            companyId={companyDetails.companyId}
          />
        ))}
      </div> */}
      {isModalOpen && (
        <AddCategoryModal
          onClose={() => setIsModalOpen(false)}
          onAddCategory={handleAddCategory}
        />
      )}
    </div>
  );
};

// const CategoryCard = ({
//   category,
//   setCategories,
//   setCategoriesCount,
//   companyId,
// }) => {
//   return (
//     <div className="bg-white p-4 rounded shadow">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold">{category.name}</h2>
//         <button
//
//           className="text-white bg-red-500 h-6 w-6 font-bold text-center rounded-full flex items-center justify-center"
//         >
//           <div className="w-3 h-1 bg-white"></div>
//         </button>
//       </div>
//     </div>
//   );
// };

const AddCategoryModal = ({ onClose, onAddCategory }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }
    setIsLoading(true);

    try {
      const categoryRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "categories"
      );
      const newCategory = {
        name: categoryName,
        createdAt: new Date(),
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
      <div className="bg-white w-full max-w-sm p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Category</h2>
        <div className="mb-4">
          <label htmlFor="CategoryName" className="block text-gray-700 mb-2">
            Category Name
          </label>
          <input
            id="categoryName"
            type="text"
            className="w-full p-2 border rounded"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddCategory}
            className={`${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            } text-white px-4 py-2 rounded hover:bg-blue-600 transition`}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Categories;
