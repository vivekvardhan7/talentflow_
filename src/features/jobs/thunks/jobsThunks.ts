import { createAsyncThunk } from "@reduxjs/toolkit";
import { jobsApi } from "@/services/api";
import { Job } from "@/lib/database";

export interface JobsFilters {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Fetch jobs with filters and pagination
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (filters: JobsFilters = {}, { rejectWithValue }) => {
    try {
      const response = await jobsApi.getJobs(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch jobs");
    }
  }
);

// Fetch single job by ID
export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await jobsApi.getJobById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch job");
    }
  }
);

// Create new job
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData: Omit<Job, "id" | "slug" | "createdAt" | "updatedAt" | "order">, { rejectWithValue }) => {
    try {
      const response = await jobsApi.createJob(jobData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create job");
    }
  }
);

// Update job
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ id, updates }: { id: string; updates: Partial<Job> }, { rejectWithValue }) => {
    try {
      const response = await jobsApi.updateJob(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update job");
    }
  }
);

// Delete job
export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (id: string, { rejectWithValue }) => {
    try {
      await jobsApi.deleteJob(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete job");
    }
  }
);

// Reorder jobs
export const reorderJobs = createAsyncThunk(
  "jobs/reorderJobs",
  async (jobIds: string[], { rejectWithValue }) => {
    try {
      await jobsApi.reorderJobs(jobIds);
      return jobIds;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to reorder jobs");
    }
  }
);
