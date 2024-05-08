import { createSlice } from "@reduxjs/toolkit";

export const teamsSlice = createSlice({
  name: "task",
  initialState: {
    context: null,
  },
  reducers: {
    setTeamsContext: (state, action) => {
      state.context = action.payload;
    },
  },
});

export const { setTeamsContext } = teamsSlice.actions;

export default teamsSlice.reducer;
