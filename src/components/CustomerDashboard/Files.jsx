import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebase";

const Files = () => {
  const [files, setFiles] = useState([]);
  const { id } = useParams();
  const projectId = id;
  const userDetails = useSelector((state) => state.users);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      const filesRef = collection(db, "projects", projectId, "files");
      const q = query(filesRef, where("phoneNumber", "==", userDetails.phone));
      const querySnapshot = await getDocs(q);
      const filesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }

  return (
    <div
      className="bg-white-500  p-4 overflow-y-auto"
      style={{ height: "92vh" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <Link className="flex items-center " to={"./../"}>
            <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
          </Link>
          <h1 className="text-xl font-bold">Files</h1>
        </div>
      </div>

      <div className="rounded-lg p-6 space-y-4">
        {files.map((file) => {
          const createdAt = file.createdAt?.toDate().toLocaleDateString();

          return (
            <div
              key={file.id}
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={file.fileURL}
                  alt={file.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div>
                  <h2 className="text-gray-800 font-semibold">{file.name}</h2>
                  <p className="text-gray-600 text-sm">{createdAt}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Files;
