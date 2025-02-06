import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Template1 from "./Template1";
import Template10 from "./Template10";
import Template11 from "./Template11";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";
import Template6 from "./Template6";
import Template7 from "./Template7";
import Template8 from "./Template8";
import Template9 from "./Template9";
import Template2Inch from "./pos/Template2Inch";

function TemplateView() {
  const { templateId } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const encodedState = query.get("state");
  const decodedState = atob(encodedState);
  const { dataSet, bankDetails } = JSON.parse(decodedState);

  const invoiceRef = useRef();
  const templatesComponents = {
    template1: (
      <Template1 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),

    template2: (
      <Template2 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),

    template3: (
      <Template3 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),

    template4: (
      <Template4 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),
    template5: (
      <Template5 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),

    template6: (
      <Template6 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),
    template7: (
      <Template7 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),
    template8: (
      <Template8 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),
    template9: (
      <Template9 ref={invoiceRef} dataSet={dataSet} bankDetails={bankDetails} />
    ),
    template10: (
      <Template10
        ref={invoiceRef}
        dataSet={dataSet}
        bankDetails={bankDetails}
      />
    ),
    template11: (
      <Template11
        ref={invoiceRef}
        dataSet={dataSet}
        bankDetails={bankDetails}
      />
    ),
    template2In: (
      <Template2Inch ref={invoiceRef}
        dataSet={dataSet} size={2} />
    ),
    template3In: (
      <Template2Inch ref={invoiceRef}
        dataSet={dataSet} size={3} />
    ),
  };
  return (
    <div className="bg-gray-400 min-h-screen flex justify-center items-center w-full overflow-y-auto">
      {templatesComponents[templateId]}
    </div>
  );
}

export default TemplateView;
