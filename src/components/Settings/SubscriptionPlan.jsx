import { SiTicktick } from "react-icons/si";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: 0,
      buttonText: "Register FREE",
      featured: false,
      features: ["Free"],
      pricingType: "rupees",
    },
    {
      name: "Plus Plan",
      price: 500,
      buttonText: "Purchase Now",
      featured: false,
      features: ["Paid with Basic tools"],
      pricingType: "rupees",
    },
    {
      name: "Pro Plan",
      price: 1000,
      buttonText: "Purchase Now",
      featured: true,
      features: ["Advanced Option", "Access to all the tools"],
      pricingType: "rupees",
    },
    {
      name: "Business Plan",
      price: 0,
      buttonText: "Contact us",
      featured: false,
      features: ["Based on customization"],
      pricingType: "custom",
    },
  ];
  return (
    <div
      className="overflow-y-auto text-blue-600 py-6"
      style={{ height: "92vh" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-blue-900 text-center mb-6">
          Pricing
        </h2>
        <p className="text-center text-blue-800 font-bold text-3xl mb-12">
          Plan of the Business Owner
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`h-[500px] transform transition duration-300 ${
                plan.featured
                  ? "bg-yellow-400 text-white hover:scale-105 hover:shadow-xl"
                  : "bg-white text-blue-800 hover:scale-105 hover:shadow-lg hover:bg-blue-50"
              } p-6 rounded-lg shadow-md`}
            >
              <h3 className="text-xl font-bold w-48 h-10 text-left pl-3 pt-2 rounded-br-lg rounded-tl-lg bg-red-100 text-red-800 mt-[-25px] ml-[-25px]">
                {plan.name}
              </h3>
              {plan.pricingType === "custom" && (
                <p className="text-sm font-semibold mt-5 mb-3">
                  Custom pricing
                </p>
              )}
              {plan.pricingType === "rupees" && plan.price >= 0 && (
                <p className="text-2xl font-bold mt-4">₹{plan.price}</p>
              )}
              {plan.pricingType === "rupees" && plan.price >= 0 && (
                <p className="text-sm">/month</p>
              )}
              <button
                className={`w-full transform transition duration-300 ${
                  plan.featured
                    ? "bg-white text-yellow-400"
                    : "bg-blue-600 text-white"
                } py-2 mt-6 rounded`}
              >
                {plan.buttonText}
              </button>
              <ul className="mt-8 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <SiTicktick className="inline-block mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
