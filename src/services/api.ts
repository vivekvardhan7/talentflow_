﻿﻿import { dbUtils, db } from "@/lib/database";
import { Job, Candidate, Assessment } from "@/lib/database";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random failures
const shouldFail = () => Math.random() < 0.08; // 8% failure rate

const simulateApiCall = async <T>(fn: () => Promise<T>): Promise<T> => {
  await delay(Math.random() * 1000 + 200); // 200-1200ms delay
  
  if (shouldFail()) {
    throw new Error("Simulated API failure");
  }
  
  return await fn();
};

export const jobsApi = {
  // GET /jobs?search=&status=&page=&pageSize=&sort=
  getJobs: async (params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  } = {}) => {
    return simulateApiCall(async () => {
      const allJobs = await dbUtils.getAllJobs();
      
      // Filter jobs
      let filteredJobs = allJobs;
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(searchLower) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (params.status && params.status !== "all") {
        filteredJobs = filteredJobs.filter(job => job.status === params.status);
      }
      
      // Sort jobs
      if (params.sort === "title") {
        filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (params.sort === "createdAt") {
        filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        filteredJobs.sort((a, b) => a.order - b.order);
      }
      
      // Paginate
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
      
      return {
        jobs: paginatedJobs,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: filteredJobs.length,
          totalPages: Math.ceil(filteredJobs.length / pageSize)
        }
      };
    });
  },

  // GET /jobs/:id
  getJobById: async (id: string) => {
    return simulateApiCall(async () => {
      const job = await dbUtils.getJobById(id);
      if (!job) {
        throw new Error("Job not found");
      }
      return job;
    });
  },

  // POST /jobs
  createJob: async (job: Omit<Job, "id" | "slug" | "createdAt" | "updatedAt" | "order">) => {
    return simulateApiCall(async () => {
      return await dbUtils.createJob(job);
    });
  },

  // PATCH /jobs/:id
  updateJob: async (id: string, updates: Partial<Job>) => {
    return simulateApiCall(async () => {
      const updatedJob = await dbUtils.updateJob(id, updates);
      if (!updatedJob) {
        throw new Error("Job not found");
      }
      return updatedJob;
    });
  },

  // DELETE /jobs/:id
  deleteJob: async (id: string) => {
    return simulateApiCall(async () => {
      const deleted = await dbUtils.deleteJob(id);
      if (!deleted) {
        throw new Error("Job not found");
      }
      return { success: true };
    });
  },

  // PATCH /jobs/:id/reorder
  reorderJobs: async (jobIds: string[]) => {
    return simulateApiCall(async () => {
      await dbUtils.reorderJobs(jobIds);
      return { success: true };
    });
  },
};

export const candidatesApi = {
  // GET /candidates?search=&stage=&page=
  getCandidates: async (params: {
    search?: string;
    stage?: string;
    page?: number;
    pageSize?: number;
  } = {}) => {
    return simulateApiCall(async () => {
      const allCandidates = await dbUtils.getAllCandidates();
      
      // Filter candidates
      let filteredCandidates = allCandidates;
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.stage && params.stage !== "all") {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.stage === params.stage);
      }
      
      // Paginate
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
      
      return {
        candidates: paginatedCandidates,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: filteredCandidates.length,
          totalPages: Math.ceil(filteredCandidates.length / pageSize)
        }
      };
    });
  },

  // GET /candidates/:id
  getCandidateById: async (id: string) => {
    return simulateApiCall(async () => {
      const candidate = await dbUtils.getCandidateById(id);
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      return candidate;
    });
  },

  // PATCH /candidates/:id
  updateCandidate: async (id: string, updates: Partial<Candidate>) => {
    console.log('candidatesApi.updateCandidate called with:', { id, updates });
    return simulateApiCall(async () => {
      const updatedCandidate = await dbUtils.updateCandidate(id, updates);
      if (!updatedCandidate) {
        console.error('Candidate not found during update');
        throw new Error("Candidate not found");
      }
      console.log('API update successful:', updatedCandidate);
      return updatedCandidate;
    });
  },

  // GET /candidates/:jobId/all (get all candidates for a job without pagination)
  getCandidatesByJob: async (jobId: string) => {
    console.log('candidatesApi.getCandidatesByJob called with jobId:', jobId);
    return simulateApiCall(async () => {
      const jobCandidates = await dbUtils.getCandidatesByJob(jobId);
      console.log('Found candidates for job:', jobCandidates.length);
      return jobCandidates;
    });
  },
  addNote: async (candidateId: string, note: { content: string; createdBy?: string }) => {
    return simulateApiCall(async () => {
      const newNote = await dbUtils.addCandidateNote(candidateId, {
        content: note.content,
        createdBy: note.createdBy || "user@company.com"
      });
      if (!newNote) {
        throw new Error("Candidate not found");
      }
      return newNote;
    });
  },
};

export const assessmentsApi = {
  // GET /assessments (all assessments)
  getAllAssessments: async () => {
    return simulateApiCall(async () => {
      const assessments = await db.assessments.toArray();
      return assessments;
    });
  },

  // GET /assessments/:jobId
  getAssessmentByJobId: async (jobId: string) => {
    return simulateApiCall(async () => {
      const assessment = await dbUtils.getAssessmentByJobId(jobId);
      if (!assessment) {
        throw new Error("Assessment not found");
      }
      return assessment;
    });
  },

  // PUT /assessments/:jobId
  saveAssessment: async (jobId: string, assessment: Assessment) => {
    return simulateApiCall(async () => {
      return await dbUtils.saveAssessment(assessment);
    });
  },

  // DELETE /assessments/:jobId
  deleteAssessment: async (jobId: string) => {
    return simulateApiCall(async () => {
      const deleted = await dbUtils.deleteAssessment(jobId);
      if (!deleted) {
        throw new Error("Assessment not found");
      }
      return { success: true };
    });
  },
};

export default { jobsApi, candidatesApi, assessmentsApi };
