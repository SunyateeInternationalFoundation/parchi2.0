import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Template1 from "../../Templates/Template1";
import Template10 from "../../Templates/Template10";
import Template11 from "../../Templates/Template11";
import Template2 from "../../Templates/Template2";
import Template3 from "../../Templates/Template3";
import Template4 from "../../Templates/Template4";
import Template5 from "../../Templates/Template5";
import Template6 from "../../Templates/Template6";
import Template7 from "../../Templates/Template7";
import Template8 from "../../Templates/Template8";
import Template9 from "../../Templates/Template9";

function InvoiceTemplateView() {
  const { templateId } = useParams();
  const location = useLocation();
  const { invoice, bankDetails } = location.state;
  console.log("invoice", invoice);
  console.log("bank", bankDetails);
  const invoiceRef = useRef();
  const templatesComponents = {
    template1: (
      <Template1 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),

    template2: (
      <Template2 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),

    template3: (
      <Template3 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),

    template4: (
      <Template4 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),
    template5: (
      <Template5 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),

    template6: (
      <Template6 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),
    template7: (
      <Template7 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),
    template8: (
      <Template8 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),
    template9: (
      <Template9 ref={invoiceRef} dataSet={invoice} bankDetails={bankDetails} />
    ),
    template10: (
      <Template10
        ref={invoiceRef}
        dataSet={invoice}
        bankDetails={bankDetails}
      />
    ),
    template11: (
      <Template11
        ref={invoiceRef}
        dataSet={invoice}
        bankDetails={bankDetails}
      />
    ),
  };
  return (
    <div className="bg-gray-400 min-h-screen flex justify-center items-center w-full overflow-y-auto">
      {templatesComponents[templateId]}
    </div>
  );
}

export default InvoiceTemplateView;
