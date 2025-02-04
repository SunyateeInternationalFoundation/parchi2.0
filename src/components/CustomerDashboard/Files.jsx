import FormatTimestamp from "../../constants/FormatTimestamp";

const Files = ({ files }) => {
  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container2">
        <div className=" rounded-lg overflow-y-auto" style={{ height: "80vh" }}>
          <table className="w-full border-collapse text-start">
            <thead className=" bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  File
                </td>
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  Name
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Date
                </td>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((file) => (
                  <tr
                    key={file.id}
                    className="border-b border-gray-200 text-center cursor-pointer"
                  >
                    <td className="px-8 py-3 text-start flex">
                      <img
                        src={file.fileURL}
                        alt={file.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    </td>
                    <td className="px-5 py-3 text-start">{file.name}</td>
                    <td className="px-5 py-3 text-start">
                      <FormatTimestamp timestamp={file.createdAt} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="h-24 text-center py-4 ">
                    No file Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Files;
