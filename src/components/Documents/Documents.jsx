import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { AiFillFolder, AiOutlineArrowLeft, AiOutlineFile } from 'react-icons/ai';
import { db, storage } from '../../firebase';

const Documents = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pathnames, setPathnames] = useState([]);

  useEffect(() => {
    fetchFoldersAndFiles();
  }, [currentFolder]);

  const fetchFoldersAndFiles = async () => {
    setIsLoading(true);
    try {
      const foldersQuery = query(
        collection(db, 'folders'),
        where('parentId', '==', currentFolder?.id || null)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      const fetchedFolders = foldersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'folder'
      }));

      const filesQuery = query(
        collection(db, 'files'),
        where('folderId', '==', currentFolder?.id || null)
      );
      const filesSnapshot = await getDocs(filesQuery);
      const fetchedFiles = filesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'file'
      }));

      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  const addFolder = async () => {
    if (!folderName) return;
    try {
      // const folderRef = await addDoc(collection(db, 'folders'), {
      //   name: folderName,
      //   parentId: currentFolder?.id || null,
      //   createdAt: Timestamp.now(),
      // });

      const newFolder = {
        // id: folderRef.id,
        id: 1,
        name: folderName,
        parentId: currentFolder?.id || null,
        createdAt: Timestamp.now(),
        type: 'folder'
      };

      setFolders(prev => [...prev, newFolder]);
      setFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const addFile = async (file) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const fileRef = ref(storage, `files/${currentFolder?.id || 'root'}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('File upload error:', error);
          setIsLoading(false);
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const fileData = {
            name: file.name,
            folderId: currentFolder?.id || null,
            fileUrl,
            createdAt: Timestamp.now(),
            type: 'file',
            size: file.size,
            contentType: file.type
          };

          const fileRef = await addDoc(collection(db, 'files'), fileData);
          const newFile = { ...fileData, id: fileRef.id };
          
          setFiles(prev => [...prev, newFile]);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('File upload error:', error);
      setIsLoading(false);
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    setCurrentPath(prev => [...prev, folder]);
    setPathnames(val=>[...val,folder.name])
  };

  const navigateBack = () => {
    const newPath = currentPath.slice(0, -1);
    setCurrentPath(newPath);
    setCurrentFolder(newPath[newPath.length - 1] || null);
    setPathnames(pathnames.slice(0, -1))
  };

  const handleFileClick = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
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
          📂  Create New Folder
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
      <label
        htmlFor="file-upload"
        className="cursor-pointer border bg-green-500 text-white  border-gray-300 inline-block px-4 py-2 text-center rounded-lg hover:bg-green-600 disabled:bg-green-300"
      >
        📄 Upload File
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={(e) => {addFile(e.target.files[0])}}
      />
    </div>
        </div>
      </div>
      <div>
      <nav>
      <ul style={{ display: "flex", listStyle: "none" }}>
        <li>
              <div className='cursor-pointer' onClick={() => {
                setCurrentPath([])
                setCurrentFolder([])
                setPathnames([])
              }
          }>Home</div>
        </li>
        {pathnames.map((value, index) => {
          return (
            <li key={index} className='flex cursor-pointer' style={{ marginLeft: "3px" }}>
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
             
            <p className="text-center font-medium truncate hover:text-clip w-full ">{folder.name}</p>
          </div>
          </div>
        ))}
        
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleFileClick(file.fileUrl)}
            className="flex justify-center items-center gap-3 rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <div>

            <AiOutlineFile className="w-24 h-24 text-blue-500" />
            <div>
              <p className="font-medium truncate hover:text-clip w-24 ">{file.name}</p>
              {/* <p className="text-sm text-gray-500">
                {formatDate(file.createdAt)}
              </p> */}
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;