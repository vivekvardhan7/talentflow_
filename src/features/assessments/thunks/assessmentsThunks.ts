﻿import { createAsyncThunk } from "@reduxjs/toolkit";
import { assessmentsApi } from "@/services/api";
import { Assessment } from "@/lib/database";

// Fetch all assessments
export const fetchAllAssessments = createAsyncThunk(
  "assessments/fetchAllAssessments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await assessmentsApi.getAllAssessments();
      return response;
    } catch (error: any) {
      // return rejectWithValue(error.response?.data?.error || "Failed to fetch assessments");
    }
  }
);

// Fetch assessment by job ID
export const fetchAssessmentByJobId = createAsyncThunk(
  "assessments/fetchAssessmentByJobId",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await assessmentsApi.getAssessmentByJobId(jobId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch assessment");
    }
  }
);

// Save assessment
export const saveAssessment = createAsyncThunk(
  "assessments/saveAssessment",
  async ({ jobId, assessment }: { jobId: string; assessment: Assessment }, { rejectWithValue }) => {
    try {
      const response = await assessmentsApi.saveAssessment(jobId, assessment);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to save assessment");
    }
  }
);

// Delete assessment
export const deleteAssessment = createAsyncThunk(
  "assessments/deleteAssessment",
  async (jobId: string, { rejectWithValue }) => {
    try {
      await assessmentsApi.deleteAssessment(jobId);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete assessment");
    }
  }
);
