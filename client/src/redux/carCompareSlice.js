import { createSlice } from "@reduxjs/toolkit";
import { cleanCompareIds, listingId, MAX_COMPARE_CARS, readCompareStorage } from "../utils/carCompare.js";

const slice = createSlice({
  name: "carCompare",
  initialState: () => {
    if (typeof window === "undefined") return { ids: [], storageUnavailable: false, replacementId: null };
    try { return { ...readCompareStorage(window.localStorage), replacementId: null }; }
    catch { return { ids: [], storageUnavailable: true, replacementId: null }; }
  },
  reducers: {
    addComparisonCar(state, { payload }) {
      const id = listingId(payload);
      if (!id || state.ids.includes(id)) return;
      const replaceIndex = state.ids.indexOf(state.replacementId);
      if (replaceIndex >= 0) {
        state.ids[replaceIndex] = id;
        state.replacementId = null;
      } else if (state.ids.length < MAX_COMPARE_CARS) {
        state.ids.push(id);
      }
    },
    removeComparisonCar(state, { payload }) {
      const id = listingId(payload);
      if (state.ids.includes(id)) state.ids = state.ids.filter((carId) => carId !== id);
      if (state.replacementId === id) state.replacementId = null;
    },
    setComparisonCars(state, { payload }) {
      const ids = cleanCompareIds(payload);
      if (ids.join(",") !== state.ids.join(",")) state.ids = ids;
      state.replacementId = null;
    },
    setComparisonReplacement(state, { payload }) {
      state.replacementId = state.ids.includes(payload) ? payload : null;
    },
    setCompareStorageUnavailable(state) {
      state.storageUnavailable = true;
    },
  },
});

export const { addComparisonCar, removeComparisonCar, setComparisonCars, setComparisonReplacement, setCompareStorageUnavailable } = slice.actions;
export default slice.reducer;
