import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  AiFillFolder,
  AiOutlineArrowLeft,
  AiOutlineFile,
} from "react-icons/ai";
import { HiDotsVertical } from "react-icons/hi";
import { useSelector } from "react-redux";
import { db, storage } from "../../firebase";

const Documents = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pathnames, setPathnames] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
  const [newName, setNewName] = useState("");
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const companyRef = doc(db, "companies", companyId);
  useEffect(() => {
    fetchFoldersAndFiles();
  }, [currentFolder]);

  const fetchFoldersAndFiles = async () => {
    setIsLoading(true);
    try {
      const foldersQuery = query(
        collection(db, "folders"),
        where("parentId", "==", currentFolder?.id || null),
        where("companyRef", "==", companyRef)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      const fetchedFolders = foldersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "folder",
      }));

      const filesQuery = query(
        collection(db, "files"),
        where("folderId", "==", currentFolder?.id || null),
        where("companyRef", "==", companyRef)
      );
      const filesSnapshot = await getDocs(filesQuery);
      const fetchedFiles = filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "file",
        isOutlineDotsOpen: false,
      }));

      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const addFolder = async () => {
    if (!folderName) return;
    try {
      const folderRef = await addDoc(collection(db, "folders"), {
        name: folderName,
        parentId: currentFolder?.id || null,
        createdAt: Timestamp.now(),
      });

      const newFolder = {
        id: folderRef.id,
        name: folderName,
        parentId: currentFolder?.id || null,
        createdAt: Timestamp.now(),
        type: "folder",
        companyRef,
      };

      setFolders((prev) => [...prev, newFolder]);
      setFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const addFile = async (file) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const fileRef = ref(
        storage,
        `files/${currentFolder?.id || "root"}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("File upload error:", error.message);
          setIsLoading(false);
          setUploadProgress(null);
        },
        async () => {
          try {
            const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const fileData = {
              name: file.name,
              folderId: currentFolder?.id || null,
              fileUrl,
              createdAt: Timestamp.now(),
              type: "file",
              size: file.size,
              contentType: file.type,
              companyRef,
            };

            const fileRef = await addDoc(collection(db, "files"), fileData);
            const newFile = { ...fileData, id: fileRef.id };

            setFiles((prev) => [...prev, newFile]);
          } catch (uploadError) {
            console.error("Error saving file metadata:", uploadError.message);
          } finally {
            setIsLoading(false);
            setUploadProgress(null);
          }
        }
      );
    } catch (error) {
      console.error("File upload error:", error);
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    setCurrentPath((prev) => [...prev, folder]);
    setPathnames((val) => [...val, folder.name]);
  };

  const navigateBack = () => {
    const newPath = currentPath.slice(0, -1);
    setCurrentPath(newPath);
    setCurrentFolder(newPath[newPath.length - 1] || null);
    setPathnames(pathnames.slice(0, -1));
  };

  const handleFileClick = (fileUrl) => {
    if (!editingItem) {
      window.open(fileUrl, "_blank");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renameFolderOrFile = async (item, newName) => {
    if (!newName) return;
    try {
      const itemRef = doc(
        db,
        item.type === "folder" ? "folders" : "files",
        item.id
      );
      await updateDoc(itemRef, { name: newName });
      if (item.type === "folder") {
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === item.id ? { ...folder, name: newName } : folder
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === item.id ? { ...file, name: newName } : file
          )
        );
      }
      setEditingItem(null);
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const deleteFolderOrFile = async (item) => {
    try {
      if (item.type === "file") {
        const fileRef = ref(
          storage,
          `files/${item.folderId || "root"}/${item.name}`
        );
        await deleteObject(fileRef);
      }

      const itemRef = doc(
        db,
        item.type === "folder" ? "folders" : "files",
        item.id
      );
      await deleteDoc(itemRef);

      if (item.type === "folder") {
        setFolders((prev) => prev.filter((folder) => folder.id !== item.id));
      } else {
        setFiles((prev) => prev.filter((file) => file.id !== item.id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {currentPath.length > 0 && (
            <button
              onClick={navigateBack}
              className="p-2 rounded hover:bg-gray-200 flex items-center"
            >
              <AiOutlineArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold">
            Documents
            {/* {currentPath.length === 0 ? 'Documents' : currentFolder.name} */}
          </h1>
          {isLoading && <span className="text-gray-500">Loading...</span>}
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name"
            className="px-4 py-2 rounded bg-gray-200"
          />
          <button
            onClick={addFolder}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            📂 Create New Folder
          </button>
          {/* <input
            type="file"
           
            className="px-4 py-2 rounded bg-gray-200"
          />
          <button
            onClick={addFile}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
          >
            Add File
          </button> */}
          <div>
            {uploadProgress !== null ? (
              <button
                disabled
                className="cursor-pointer bg-green-500 text-white border-gray-300 inline-block w-48 py-2 text-center rounded-lg hover:bg-green-600"
                style={{ height: "40px" }}
              >
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
                </div>
              </button>
            ) : (
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-green-500 text-white border-gray-300 inline-block w-48 py-2 text-center rounded-lg hover:bg-green-600"
                style={{ height: "40px" }} // Fixed height
              >
                📄 Upload File
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => addFile(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div>
        <nav>
          <ul style={{ display: "flex", listStyle: "none" }}>
            <li>
              <div
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPath([]);
                  setCurrentFolder([]);
                  setPathnames([]);
                }}
              >
                Home
              </div>
            </li>
            {pathnames.map((value, index) => {
              return (
                <li
                  key={index}
                  className="flex cursor-pointer"
                  style={{ marginLeft: "3px" }}
                >
                  {">"} <div>{value}</div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="grid grid-cols-10 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => navigateToFolder(folder)}
            className="flex justify-center items-center gap-3 rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <div>
              <AiFillFolder className="w-24 h-24 text-yellow-500" />

              <p className="text-center font-medium truncate hover:text-clip w-full ">
                {folder.name}
              </p>
            </div>
          </div>
        ))}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex justify-center items-center gap-3 rounded-lg cursor-pointer hover:bg-gray-200 relative"
          >
            <div className="px-2 py-1 text-xs">
              <div onClick={() => handleFileClick(file.fileUrl)}>
                <AiOutlineFile className="w-24 h-24 text-blue-500" />
              </div>
              {editingItem === file.id ? (
                <input
                  type="text"
                  value={newName || file.name}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => renameFolderOrFile(file, newName || file.name)}
                  autoFocus
                  className="w-full text-center bg-transparent border-b-2 border-gray-400"
                />
              ) : (
                <p className="text-center font-medium ">{file.name}</p>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles(
                    files.map((ele) => {
                      ele.isOutlineDotsOpen = !ele.isOutlineDotsOpen;
                      return ele;
                    })
                  );
                }}
              >
                <HiDotsVertical className="font-bold" />
              </button>
              {file.isOutlineDotsOpen && (
                <div className="absolute bg-white  p-1 right-0 cursor-pointer border-2 rounded-lg text-xs">
                  <div
                    className="pe-2 py-1 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(file.id);
                      setNewName(file.name);
                      setFiles(
                        files.map((ele) => {
                          ele.isOutlineDotsOpen = false;
                          return ele;
                        })
                      );
                    }}
                  >
                    <div>Edit</div>
                  </div>
                  <div
                    className="py-1 pe-2 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(`Are you sure to delete "${file.name}"?`)
                      ) {
                        deleteFolderOrFile(file);
                      }
                      setFiles(
                        files.map((ele) => {
                          ele.isOutlineDotsOpen = false;
                          return ele;
                        })
                      );
                    }}
                  >
                    <div> Delete</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
