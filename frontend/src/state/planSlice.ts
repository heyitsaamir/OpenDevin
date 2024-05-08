import { createSlice } from "@reduxjs/toolkit";
import { Plan, TaskState } from "#/services/planService";

export const planSlice = createSlice({
  name: "plan",
  initialState: {
    plan: {
      mainGoal: undefined,
      task: {
        id: "",
        goal: "",
        parent: "Task | None",
        subtasks: [],
        state: TaskState.OPEN_STATE,
      },
    } as Plan,
  },
  reducers: {
    setPlan: (state, action) => {
      if (action.payload != null) {
        state.plan = action.payload as Plan;
      }
    },
    resetPlan: (state) => {
      state.plan = {
        mainGoal: undefined,
        task: {
          id: "",
          goal: "",
          parent: "Task | None",
          subtasks: [],
          state: TaskState.OPEN_STATE,
        },
      };
    },
  },
});

export const { setPlan, resetPlan } = planSlice.actions;

export default planSlice.reducer;
