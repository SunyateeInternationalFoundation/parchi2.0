import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  data: [],
};

const CustomerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setAllCustomersDetails: (state, action) => {
      state.data = action.payload;
    },
    deleteCustomerDetails: (state, action) => {
      const customerId = action.payload;
      state.data = state.data.filter((ele) => ele.id !== customerId);
    },
    setCustomerDetails: (state, action) => {
      const customerData = action.payload;
      state.data.push(customerData);
    },
    updateCustomerDetails: (state, action) => {
      console.log("🚀 ~ action.payload:", action.payload);

      const customerData = action.payload;
      state.data = state.data.map((ele) => {
        if (ele.id === customerData.id) {
          ele = customerData;
        }
        return ele;
      });
    },
  },
});

export const {
  setAllCustomersDetails,
  setCustomerDetails,
  deleteCustomerDetails,
  updateCustomerDetails,
} = CustomerSlice.actions;

export default CustomerSlice.reducer;
