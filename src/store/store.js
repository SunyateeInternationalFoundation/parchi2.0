import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./UserSlice";
import ProjectSlice from "./ProjectSlice";
import CustomerSlice from "./CustomerSlice";

const store = configureStore({
  reducer: {
    users: userSlice,
    projects: ProjectSlice,
    customers: CustomerSlice,
  },
});

export default store;
