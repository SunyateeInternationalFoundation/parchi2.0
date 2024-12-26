import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  data: [],
};

const VenderSlice = createSlice({
  name: "venders",
  initialState,
  reducers: {
    setVendersDetails: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setVendersDetails: setProjectsDetails } = VenderSlice.actions;

export default VenderSlice.reducer;
