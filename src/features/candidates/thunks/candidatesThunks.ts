import { createAsyncThunk } from "@reduxjs/toolkit";
import { candidatesApi } from "@/services/api";
import { Candidate, Note } from "@/lib/database";

export interface CandidatesFilters {
  search?: string;
  stage?: string;
  page?: number;
  pageSize?: number;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Fetch candidates with filters and pagination
export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (filters: CandidatesFilters = {}, { rejectWithValue }) => {
    try {
      const response = await candidatesApi.getCandidates(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch candidates");
    }
  }
);

// Fetch single candidate by ID
export const fetchCandidateById = createAsyncThunk(
  "candidates/fetchCandidateById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await candidatesApi.getCandidateById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch candidate");
    }
  }
);

// Update candidate
export const updateCandidate = createAsyncThunk(
  "candidates/updateCandidate",
  async ({ id, updates }: { id: string; updates: Partial<Candidate> }, { rejectWithValue }) => {
    try {
      const response = await candidatesApi.updateCandidate(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update candidate");
    }
  }
);

// Add note to candidate
export const addCandidateNote = createAsyncThunk(
  "candidates/addNote",
  async ({ candidateId, note }: { candidateId: string; note: { content: string; createdBy?: string } }, { rejectWithValue }) => {
    try {
      const response = await candidatesApi.addNote(candidateId, note);
      return { candidateId, note: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to add note");
    }
  }
);

// Fetch candidates for a specific job (all candidates, no pagination)
export const fetchCandidatesByJob = createAsyncThunk(
  "candidates/fetchCandidatesByJob",
  async (jobId: string, { rejectWithValue }) => {
    try {
      console.log('fetchCandidatesByJob thunk called for job:', jobId);
      const response = await candidatesApi.getCandidatesByJob(jobId);
      console.log('fetchCandidatesByJob thunk response:', response.length, 'candidates');
      return response;
    } catch (error: any) {
      console.error('fetchCandidatesByJob thunk error:', error);
      return rejectWithValue(error.response?.data?.error || "Failed to fetch candidates for job");
    }
  }
);

// Update candidate stage
export const updateCandidateStage = createAsyncThunk(
  "candidates/updateStage",
  async ({ candidateId, newStage, movedBy }: { candidateId: string; newStage: Candidate["stage"]; movedBy?: string }, { rejectWithValue }) => {
    try {
      const response = await candidatesApi.updateCandidate(candidateId, { stage: newStage });
      return { candidateId, newStage, movedBy, candidate: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update candidate stage");
    }
  }
);
