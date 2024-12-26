import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  data: [],
};
// function DateFormate(timestamp) {
//   const milliseconds =
//   timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
// const date = new Date(milliseconds);
// const getDate = String(date.getDate()).padStart(2, "0");
// const getMonth = String(date.getMonth() + 1).padStart(2, "0");
// const getFullYear = date.getFullYear();
// return `${getDate}/${getMonth}/${getFullYear}`;
// }
// async function fetchData() {
//   const { companies, selectedCompanyIndex } = JSON.parse(
//     localStorage.getItem("user")
//   );
//   const companyRef = doc(
//     db,
//     "companies",
//     companies[selectedCompanyIndex].companyId
//   );

//   const projectRef = collection(db, "projects");

//   const q = query(projectRef, where("companyRef", "==", companyRef));
//   const querySnapshot = await getDocs(q);
//   const projectsData = querySnapshot.docs.map((doc) => {
//     const { projectMembers, companyRef, createdAt, ...rest } = doc.data();
//     return {
//       ...rest,
//       projectId: doc.id,
//       companyRef: companyRef.id,
//       createdAt: DateFormate(createdAt),
//       startDate: DateFormate(rest.startDate),
//       dueDate: DateFormate(rest.dueDate),
//       vendorsRef: rest?.vendorsRef?.map((ref) => ref.id),
//       customersRef: rest?.customersRef?.map((ref) => ref.id),
//     };
//   });
//   return projectsData;
// }

const ProjectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjectsDetails: (state, action) => void (state.data = action.payload),
  },
});

export const { setProjectsDetails } = ProjectSlice.actions;

export default ProjectSlice.reducer;
