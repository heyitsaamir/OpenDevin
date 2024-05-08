import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  // URL of browser window (placeholder for now, will be replaced with the actual URL later)
  url: "https://github.com/OpenDevin/OpenDevin",
  // Base64-encoded screenshot of browser window (placeholder for now, will be replaced with the actual screenshot later)
  screenshotSrc: "",
};

export const browserSlice = createSlice({
  name: "browser",
  initialState,
  reducers: {
    setUrl: (state, action) => {
      state.url = action.payload;
    },
    setScreenshotSrc: (state, action) => {
      state.screenshotSrc = action.payload;
    },
    resetBrowser: (state) => {
      state.url = initialState.url;
      state.screenshotSrc = initialState.screenshotSrc;
    },
  },
});

export const { setUrl, setScreenshotSrc, resetBrowser } = browserSlice.actions;

export default browserSlice.reducer;
