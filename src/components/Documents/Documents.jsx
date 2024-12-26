import React, { useState, useEffect } from 'react';
import { AiFillFolder, AiOutlineFile } from 'react-icons/ai';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { db, storage } from '../../firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Documents = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const folderRef = await addDoc(collection(db, 'folders'), {
        name: folderName,
        parentId: currentFolder?.id || null,
        createdAt: Timestamp.now(),
      });

      const newFolder = {
        id: folderRef.id,
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

  const addFile = async () => {
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
          setFile(null);
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
  };

  const navigateBack = () => {
    const newPath = currentPath.slice(0, -1);
    setCurrentPath(newPath);
    setCurrentFolder(newPath[newPath.length - 1] || null);
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
          <h1 className="text-2xl font-bold">
            {currentPath.length === 0 ? 'Documents' : currentFolder.name}
          </h1>
          {isLoading && <span className="text-gray-500">Loading...</span>}
        </div>
        <div className="flex gap-4">
          {currentPath.length > 0 && (
            <button
              onClick={navigateBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <AiOutlineArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
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
            Add Folder
          </button>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="px-4 py-2 rounded bg-gray-200"
          />
          <button
            onClick={addFile}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
          >
            Add File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => navigateToFolder(folder)}
            className="flex items-center gap-3 p-4 rounded-lg shadow cursor-pointer bg-gray-100 hover:bg-gray-200"
          >
            <AiFillFolder className="w-8 h-8 text-yellow-500" />
            <p className="text-lg font-medium">{folder.name}</p>
          </div>
        ))}
        
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleFileClick(file.fileUrl)}
            className="flex items-center gap-3 p-4 rounded-lg shadow cursor-pointer bg-gray-100 hover:bg-gray-200"
          >
            <AiOutlineFile className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-lg font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(file.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;