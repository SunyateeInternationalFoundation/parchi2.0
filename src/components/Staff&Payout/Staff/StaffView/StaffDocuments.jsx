import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  AiFillFolder,
  AiOutlineArrowLeft,
  AiOutlineFile,
} from "react-icons/ai";
import { HiDotsVertical } from "react-icons/hi";
import { useSelector } from "react-redux";
import { db, storage } from "../../../../firebase";

const StaffDocuments = (StaffData) => {
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState("New Folder");
  const [countOfNewFolder, setCountOfNewFolder] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const [isLoading, setIsLoading] = useState(false);
  const [pathnames, setPathnames] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
  const [newName, setNewName] = useState("");

  const staffId = StaffData?.staffData?.id;

  const staffRef = staffId ? doc(db, "staff", staffId) : "";

  useEffect(() => {
    fetchFoldersAndFiles();
  }, [currentFolder]);

  const fetchFoldersAndFiles = async () => {
    setIsLoading(true);
    try {
      const foldersQuery = query(
        collection(staffRef, "folders"),
        where("parentId", "==", currentFolder?.id || null)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      let count = 0;
      const fetchedFolders = foldersSnapshot.docs.map((doc) => {
        const { name } = doc.data();
        if (name.includes("New Folder")) {
          if (name.includes("New Folder(")) {
            const n = name.split("New Folder(")[1].split(")");
            if (count <= +n[0]) {
              count = +n[0] + 1;
            }
          } else {
            if (count == 0) {
              count = 1;
            }
          }
        }
        return {
          id: doc.id,
          ...doc.data(),
          type: "folder",
          isOutlineDotsOpen: false,
        };
      });

      if (count > 0) {
        setFolderName("New Folder(" + count + ")");
        setCountOfNewFolder(count + 1);
      }

      const filesQuery = query(
        collection(staffRef, "files"),
        where("folderId", "==", currentFolder?.id || null)
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
      if (currentFolder?.name) {
        setCurrentPath((prev) => [...prev, currentFolder]);
        setPathnames((val) => [...val, currentFolder?.name]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const addFolder = async () => {
    try {
      const folderRef = await addDoc(collection(staffRef, "folders"), {
        name: folderName,
        parentId: currentFolder?.id || null,
        createdAt: Timestamp.now(),
      });
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: folderRef,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Create",
        description: `${folderName} folder created`,
      });
      setEditingItem(folderRef.id);
      const newFolder = {
        id: folderRef.id,
        name: folderName,
        parentId: currentFolder?.id || null,
        createdAt: Timestamp.now(),
        type: "folder",
      };
      setNewName(folderName);
      setFolders((prev) => [...prev, newFolder]);
      setFolderName("New Folder(" + (+countOfNewFolder + 1) + ")");
      setCountOfNewFolder(countOfNewFolder + 1);
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
        `staff/files/${currentFolder?.id || "root"}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("File upload error:", error.message);
          setIsLoading(false);
          setUploadProgress(null);
        },
        async () => {
          try {
            const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (!staffId) {
              console.error("Staff ID is missing.");
              return;
            }
            const fileData = {
              name: file.name,
              folderId: currentFolder?.id || null,
              fileUrl,
              createdAt: Timestamp.now(),
              type: "file",
              size: file.size,
              contentType: file.type,
            };

            const fileRef = await addDoc(
              collection(staffRef, "files"),
              fileData
            );
            await addDoc(collection(db, "companies", companyId, "audit"), {
              ref: fileRef,
              date: serverTimestamp(),
              section: "Staff&Payout",
              action: "Create",
              description: `${fileData.name} file uploaded`,
            });
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

  const renameFolderOrFile = async (item, newName) => {
    if (!newName) return;
    try {
      const itemRef = doc(
        staffRef,
        item.type === "folder" ? "folders" : "files",
        item.id
      );
      await updateDoc(itemRef, { name: newName });
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: itemRef,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Update",
        description: `${newName} ${item.type} name updated`,
      });
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
          `staff/files/${item.folderId || "root"}/${item.name}`
        );
        await deleteObject(fileRef);
      }

      const itemRef = doc(
        staffRef,
        item.type === "folder" ? "folders" : "files",
        item.id
      );
      await deleteDoc(itemRef);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: itemRef,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Delete",
        description: `${item.name} ${item.type} deleted`,
      });
      if (item.type === "folder") {
        setFolders((prev) => prev.filter((folder) => folder.id !== item.id));
      } else {
        setFiles((prev) => prev.filter((file) => file.id !== item.id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-container">
      <div className="container2 p-5" style={{ minHeight: "70vh" }}>
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
            <h1 className="text-2xl font-bold">Documents</h1>
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-md border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoading && <span className="text-gray-500">Loading...</span>}
          </div>
          <div className="flex gap-4">
            {/* <input
               type="text"
               value={folderName}
               onChange={(e) => setFolderName(e.target.value)}
               placeholder="Folder name"
               className="px-4 py-2 rounded bg-gray-200"
             /> */}
            <button
              onClick={addFolder}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              📂 Create New Folder
            </button>
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

        <div className="pb-5">
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
        <div className="grid grid-cols-8 gap-4 ">
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => navigateToFolder(folder)}
              className="flex justify-center items-center gap-3 rounded-lg cursor-pointer hover:bg-gray-200 relative border p-5"
            >
              <div>
                <AiFillFolder className="w-24 h-24 text-yellow-500" />
                {editingItem === folder.id ? (
                  <input
                    type="text"
                    value={newName ?? folder.name}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() =>
                      renameFolderOrFile(folder, newName || folder.name)
                    }
                    autoFocus
                    className="w-full text-center text-xs bg-transparent border border-gray-400"
                  />
                ) : (
                  <p className="text-center text-xs text-ellipsis  h-4">
                    {folder.name}
                  </p>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolders(
                      folders.map((ele) => {
                        if (ele.id == folder.id) {
                          ele.isOutlineDotsOpen = !ele.isOutlineDotsOpen;
                        }
                        return ele;
                      })
                    );
                  }}
                >
                  <HiDotsVertical className="font-bold" />
                </button>
                {folder.isOutlineDotsOpen && (
                  <div className="absolute bg-white  p-1 right-0 cursor-pointer border-2 rounded-lg text-xs">
                    <div
                      className="pe-2 py-1 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(folder.id);
                        setNewName(folder.name);
                        setFolders(
                          folders.map((ele) => {
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
                          window.confirm(
                            `Are you sure to delete "${folder.name}"?`
                          )
                        ) {
                          deleteFolderOrFile(folder);
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

          {files.map((file) => (
            <div
              key={file.id}
              className="flex justify-center items-center gap-3 rounded-lg cursor-pointer hover:bg-gray-200 relative border p-5"
            >
              <div className="px-2 py-1 text-xs">
                <div onClick={() => handleFileClick(file.fileUrl)}>
                  <AiOutlineFile className="w-24 h-24 text-blue-500" />
                </div>
                {editingItem === file.id ? (
                  <input
                    type="text"
                    value={newName ?? file.name}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() =>
                      renameFolderOrFile(file, newName || file.name)
                    }
                    autoFocus
                    className="w-full text-center  bg-transparent border border-gray-400"
                  />
                ) : (
                  <p className="text-center  text-ellipsis overflow-hidden h-4">
                    {file.name}
                  </p>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFiles(
                      files.map((ele) => {
                        if (ele.id == file.id) {
                          ele.isOutlineDotsOpen = !ele.isOutlineDotsOpen;
                        }
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
                          window.confirm(
                            `Are you sure to delete "${file.name}"?`
                          )
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
    </div>
  );
};

export default StaffDocuments;
