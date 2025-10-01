﻿﻿﻿import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Candidate, Note } from "@/lib/database";
import {
  fetchCandidates,
  fetchCandidateById,
  updateCandidate,
  addCandidateNote,
  updateCandidateStage,
  fetchCandidatesByJob,
  CandidatesFilters,
  CandidatesResponse
} from "./thunks/candidatesThunks";

interface CandidatesState {
  candidates: Candidate[];
  jobCandidates: Candidate[]; // All candidates for the current job (no pagination)
  currentCandidate: Candidate | null;
  loading: boolean;
  error: string | null;
  filters: CandidatesFilters;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const initialState: CandidatesState = {
  candidates: [],
  jobCandidates: [],
  currentCandidate: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    stage: "all",
    page: 1,
    pageSize: 10
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  }
};

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CandidatesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filtering
    },
    setPagination: (state, action: PayloadAction<Partial<CandidatesState["pagination"]>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch candidates
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<CandidatesResponse>) => {
        state.loading = false;
        state.candidates = action.payload.candidates;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch candidate by ID
    builder
      .addCase(fetchCandidateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update candidate
    builder
      .addCase(updateCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCandidate.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.loading = false;
        const index = state.candidates.findIndex(candidate => candidate.id === action.payload.id);
        if (index !== -1) {
          state.candidates[index] = action.payload;
        }
        if (state.currentCandidate?.id === action.payload.id) {
          state.currentCandidate = action.payload;
        }
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add candidate note
    builder
      .addCase(addCandidateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCandidateNote.fulfilled, (state, action: PayloadAction<{ candidateId: string; note: Note }>) => {
        state.loading = false;
        const { candidateId, note } = action.payload;
        const candidate = state.candidates.find(c => c.id === candidateId);
        if (candidate) {
          candidate.notes.push(note);
        }
        if (state.currentCandidate?.id === candidateId) {
          state.currentCandidate.notes.push(note);
        }
      })
      .addCase(addCandidateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update candidate stage
    builder
      .addCase(updateCandidateStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCandidateStage.fulfilled, (state, action: PayloadAction<{ candidateId: string; newStage: Candidate["stage"]; movedBy?: string; candidate: Candidate }>) => {
        state.loading = false;
        const { candidateId, candidate } = action.payload;
        const index = state.candidates.findIndex(c => c.id === candidateId);
        if (index !== -1) {
          state.candidates[index] = candidate;
        }
        // Also update in jobCandidates
        const jobIndex = state.jobCandidates.findIndex(c => c.id === candidateId);
        if (jobIndex !== -1) {
          state.jobCandidates[jobIndex] = candidate;
        }
        if (state.currentCandidate?.id === candidateId) {
          state.currentCandidate = candidate;
        }
      })
      .addCase(updateCandidateStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch candidates by job
    builder
      .addCase(fetchCandidatesByJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidatesByJob.fulfilled, (state, action: PayloadAction<Candidate[]>) => {
        state.loading = false;
        state.jobCandidates = action.payload;
      })
      .addCase(fetchCandidatesByJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setFilters,
  setPagination,
  clearError,
  clearCurrentCandidate
} = candidatesSlice.actions;

// Selectors
export const selectCandidates = (state: { candidates: CandidatesState }) => state.candidates.candidates;
export const selectCurrentCandidate = (state: { candidates: CandidatesState }) => state.candidates.currentCandidate;
export const selectCandidatesLoading = (state: { candidates: CandidatesState }) => state.candidates.loading;
export const selectCandidatesError = (state: { candidates: CandidatesState }) => state.candidates.error;
export const selectCandidatesFilters = (state: { candidates: CandidatesState }) => state.candidates.filters;
export const selectCandidatesPagination = (state: { candidates: CandidatesState }) => state.candidates.pagination;

export const selectCandidateById = (state: { candidates: CandidatesState }, candidateId: string): Candidate | undefined =>
  state.candidates.candidates.find(candidate => candidate.id === candidateId);

export const selectCandidatesByJob = (state: { candidates: CandidatesState }, jobId: string): Candidate[] =>
  state.candidates.candidates.filter(candidate => candidate.jobId === jobId);

export const selectCandidatesByStage = (state: { candidates: CandidatesState }, jobId: string): Record<string, Candidate[]> => {
  const jobCandidates = state.candidates.jobCandidates.filter(candidate => candidate.jobId === jobId);
  const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
  
  return stages.reduce((acc, stage) => {
    acc[stage] = jobCandidates.filter(candidate => candidate.stage === stage);
    return acc;
  }, {} as Record<string, Candidate[]>);
};

export const selectJobCandidates = (state: { candidates: CandidatesState }) => state.candidates.jobCandidates;

export default candidatesSlice.reducer;
