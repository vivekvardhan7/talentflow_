﻿import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Assessment } from "@/lib/database";
import {
  fetchAllAssessments,
  fetchAssessmentByJobId,
  saveAssessment,
  deleteAssessment
} from "./thunks/assessmentsThunks";

interface AssessmentsState {
  assessments: Record<string, Assessment>; // keyed by jobId
  allAssessments: Assessment[]; // for assessments list page
  loading: boolean;
  error: string | null;
}

const initialState: AssessmentsState = {
  assessments: {},
  allAssessments: [],
  loading: false,
  error: null
};

const assessmentsSlice = createSlice({
  name: "assessments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAssessment: (state, action: PayloadAction<string>) => {
      delete state.assessments[action.payload];
    }
  },
  extraReducers: (builder) => {
    // Fetch all assessments
    builder
      .addCase(fetchAllAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAssessments.fulfilled, (state, action: PayloadAction<Assessment[]>) => {
        state.loading = false;
        state.allAssessments = action.payload;
      })
      .addCase(fetchAllAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch assessment by job ID
    builder
      .addCase(fetchAssessmentByJobId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentByJobId.fulfilled, (state, action: PayloadAction<Assessment>) => {
        state.loading = false;
        state.assessments[action.payload.jobId] = action.payload;
      })
      .addCase(fetchAssessmentByJobId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Save assessment
    builder
      .addCase(saveAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAssessment.fulfilled, (state, action: PayloadAction<Assessment>) => {
        state.loading = false;
        state.assessments[action.payload.jobId] = action.payload;
      })
      .addCase(saveAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete assessment
    builder
      .addCase(deleteAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        delete state.assessments[action.payload];
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  clearError,
  clearAssessment
} = assessmentsSlice.actions;

// Selectors
export const selectAssessments = (state: { assessments: AssessmentsState }) => state.assessments.assessments;
export const selectAllAssessments = (state: { assessments: AssessmentsState }) => state.assessments.allAssessments;
export const selectAssessmentByJobId = (state: { assessments: AssessmentsState }, jobId: string): Assessment | undefined =>
  state.assessments.assessments[jobId];
export const selectAssessmentsLoading = (state: { assessments: AssessmentsState }) => state.assessments.loading;
export const selectAssessmentsError = (state: { assessments: AssessmentsState }) => state.assessments.error;

export default assessmentsSlice.reducer;
