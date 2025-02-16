import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  userId: "",
  name: "",
  email: "",
  phone: "",
  token: "",
  companies: [],
  isCompanyProfileDone: false,
  selectedCompanyIndex: 0,
  isLogin: false,
  selectedDashboard: "",
  selectedStaffCompanyIndex: 0,
  asAStaffCompanies: [],
  userAsOtherCompanies: {
    customer: [],
    vendor: [],
  },
};

if (localStorage.getItem("user")) {
  const {
    userId,
    name,
    email,
    phone,
    token,
    companies,
    selectedCompanyIndex,
    selectedStaffCompanyIndex,
    selectedDashboard,
    isCompanyProfileDone,
    userAsOtherCompanies,
  } = JSON.parse(localStorage.getItem("user"));

  initialState = {
    userId,
    name,
    email,
    phone,
    token,
    isLogin: true,
    selectedCompanyIndex,
    companies,
    isCompanyProfileDone,
    selectedDashboard: selectedDashboard,
    selectedStaffCompanyIndex,
    asAStaffCompanies: [],
    userAsOtherCompanies,
  };
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUserLogin: (state, action) => {
      const {
        userId,
        name,
        email,
        phone,
        token,
        companies,
        selectedCompanyIndex,
        selectedDashboard,
        userAsOtherCompanies,
        isCompanyProfileDone,
        selectedStaffCompanyIndex,
      } = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
      state.userId = userId;
      state.name = name;
      state.email = email;
      state.phone = phone;
      state.token = token;
      state.isLogin = true;
      state.companies = companies;
      state.isCompanyProfileDone = isCompanyProfileDone;
      state.selectedDashboard = selectedDashboard;
      state.userAsOtherCompanies = userAsOtherCompanies;
      state.selectedCompanyIndex = selectedCompanyIndex;
      state.selectedStaffCompanyIndex = selectedStaffCompanyIndex;
    },

    setCompanyData: (state, { payload }) => {
      state.companies = [...state.companies, payload];
      state.isLogin = true;
      localStorage.setItem("user", JSON.stringify(state));
    },

    setUserLogout: (state, action) => {
      localStorage.clear();
      state.userId = "";
      state.name = "";
      state.email = "";
      state.phone = "";
      state.token = "";
      state.isLogin = false;
      state.companies = [];
      state.userAsOtherCompanies = {
        customer: [],
        vendor: [],
      };
      state.selectedCompanyIndex = 0;
      state.selectedDashboard = "";
      state.selectedStaffCompanyIndex = 0;
    },

    updateUserDetails: (state, action) => {
      const { name, email, phone, selectedCompanyIndex } = action.payload;
      state.name = name ?? state.name;
      state.email = email ?? state.email;
      state.phone = phone ?? state.phone;
      state.selectedCompanyIndex =
        selectedCompanyIndex ?? state.selectedCompanyIndex;
      const updatedUser = { ...state, name, email, phone };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    },

    updateCompanyDetails: (state, action) => {
      const {
        isCalendarMonth,
        name,
        userType,
        weekOff,
        phone,
        address,
        city,
        zipCode,
        panNumber,
        gst,
        email,
        companyLogo,
      } = action.payload;

      const updatedCompanies = state.companies;
      state.companies[state.selectedCompanyIndex].isCalendarMonth =
        isCalendarMonth;
      state.companies[state.selectedCompanyIndex].name = name;
      state.companies[state.selectedCompanyIndex].userType = userType;
      state.companies[state.selectedCompanyIndex].weekOff = weekOff;
      state.companies[state.selectedCompanyIndex].phone = phone;
      state.companies[state.selectedCompanyIndex].address = address;
      state.companies[state.selectedCompanyIndex].city = city;
      state.companies[state.selectedCompanyIndex].zipCode = zipCode;
      state.companies[state.selectedCompanyIndex].panNumber = panNumber;
      state.companies[state.selectedCompanyIndex].gst = gst;
      state.companies[state.selectedCompanyIndex].email = email;
      state.companies[state.selectedCompanyIndex].companyLogo = companyLogo;
      updatedCompanies[state.selectedCompanyIndex] = {
        ...updatedCompanies[state.selectedCompanyIndex],
        isCalendarMonth,
        name,
        userType,
        weekOff,
        phone,
        address,
        city,
        zipCode,
        panNumber,
        gst,
        email,
        companyLogo,
      };
      const updatedData = { ...state, companies: updatedCompanies };
      localStorage.setItem("user", JSON.stringify(updatedData));
    },

    setAsAStaffCompanies: (state, { payload }) => {
      state.asAStaffCompanies =
        payload.asAStaffCompanies ?? state.asAStaffCompanies;
      state.selectedStaffCompanyIndex =
        payload.selectedStaffCompanyIndex ?? state.selectedStaffCompanyIndex;
      const payloadLocalStorageData = {
        ...state,
        selectedStaffCompanyIndex:
          payload.selectedStaffCompanyIndex ?? state.selectedStaffCompanyIndex,
      };
      localStorage.setItem("user", JSON.stringify(payloadLocalStorageData));
    },
    setUserAsOtherCompanies: (state, { payload }) => {
      state.userAsOtherCompanies = payload ?? state.userAsOtherCompanies;
      localStorage.setItem("user", JSON.stringify(state));
    },
  },
});

export const {
  setUserLogin,
  setUserLogout,
  updateUserDetails,
  updateCompanyDetails,
  setCompanyData,
  setAsAStaffCompanies,
  setUserAsOtherCompanies,
} = userSlice.actions;

export default userSlice.reducer;
