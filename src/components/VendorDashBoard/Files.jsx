const Files = ({ files }) => {
  return (
    <div
      className="bg-white-500  p-4 overflow-y-auto"
      style={{ height: "92vh" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
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
