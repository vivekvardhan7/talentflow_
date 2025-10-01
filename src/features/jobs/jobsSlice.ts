import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Job } from "@/lib/database";
import {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  reorderJobs,
  JobsFilters,
  JobsResponse
} from "./thunks/jobsThunks";

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  filters: JobsFilters;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    page: 1,
    pageSize: 10,
    sort: "order"
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  }
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<JobsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filtering
    },
    setPagination: (state, action: PayloadAction<Partial<JobsState["pagination"]>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<JobsResponse>) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch job by ID
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create job
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update job
    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete job
    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        state.pagination.totalItems -= 1;
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reorder jobs
    builder
      .addCase(reorderJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderJobs.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        // Reorder jobs based on the returned order
        const reorderedJobs = action.payload.map(id => 
          state.jobs.find(job => job.id === id)
        ).filter(Boolean) as Job[];
        state.jobs = reorderedJobs;
      })
      .addCase(reorderJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setFilters,
  setPagination,
  clearError,
  clearCurrentJob
} = jobsSlice.actions;

// Selectors
export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectCurrentJob = (state: { jobs: JobsState }) => state.jobs.currentJob;
export const selectJobsLoading = (state: { jobs: JobsState }) => state.jobs.loading;
export const selectJobsError = (state: { jobs: JobsState }) => state.jobs.error;
export const selectJobsFilters = (state: { jobs: JobsState }) => state.jobs.filters;
export const selectJobsPagination = (state: { jobs: JobsState }) => state.jobs.pagination;

export const selectJobById = (state: { jobs: JobsState }, jobId: string): Job | undefined => 
  state.jobs.jobs.find(job => job.id === jobId);

export default jobsSlice.reducer;
