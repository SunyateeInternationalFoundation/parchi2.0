import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  data: [],
};

const StaffSlice = createSlice({
  name: "staffs",
  initialState,
  reducers: {
    setStaffsDetails: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setStaffsDetails } = StaffSlice.actions;

export default StaffSlice.reducer;
