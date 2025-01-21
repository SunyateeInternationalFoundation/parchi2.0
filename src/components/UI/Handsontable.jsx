import { HotTable } from "@handsontable/react-wrapper";
import { registerAllModules } from "handsontable/registry";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

registerAllModules();

function Handsontable({ data, columns, className }) {
  const navigate = useNavigate();
  const hotInstance = useRef(null);

  if (data?.length <= 0) {
    return null;
  }
  const handleRowClick = (event, coords, TD) => {
    if (coords.row >= 0 && !TD.className.includes("updateStatus")) {
      const rowData = data[coords.row];
      navigate(rowData.id);
    }
  };

  return (
    <div>
      <HotTable
        ref={hotInstance}
        data={data}
        columns={columns}
        filters={true}
        dropdownMenu={[
          "filter_by_value",
          "filter_operators",
          "filter_action_bar",
        ]}
        autoWrapRow={true}
        autoWrapCol={true}
        width="100%"
        height="92vh"
        stretchH="all"
        columnSorting={true}
        className={className}
        afterOnCellMouseDown={handleRowClick}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
}

export default Handsontable;
