import { http, HttpResponse } from "msw";
import { dbUtils, db } from "@/lib/database";
import { Job, Candidate, Assessment } from "@/lib/database";

// Helper function to add random latency
const addLatency = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 1000 + 200)
);

// Helper function to randomly fail requests
const shouldFail = () => Math.random() < 0.08; // 8% failure rate

// Helper function to create error response
const createErrorResponse = (message: string, status: number = 500) => {
  return HttpResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  );
};

export const handlers = [
  // Jobs API
  http.get("/api/jobs", async ({ request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to fetch jobs");
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const sort = url.searchParams.get("sort") || "order";

    try {
      const allJobs = await dbUtils.getAllJobs();
      
      // Filter jobs
      let filteredJobs = allJobs;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(searchLower) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (status !== "all") {
        filteredJobs = filteredJobs.filter(job => job.status === status);
      }
      
      // Sort jobs
      if (sort === "title") {
        filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "createdAt") {
        filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        filteredJobs.sort((a, b) => a.order - b.order);
      }
      
      // Paginate
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
      
      return HttpResponse.json({
        jobs: paginatedJobs,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: filteredJobs.length,
          totalPages: Math.ceil(filteredJobs.length / pageSize)
        }
      });
    } catch (error) {
      return createErrorResponse("Database error while fetching jobs");
    }
  }),

  http.get("/api/jobs/:id", async ({ params }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to fetch job");
    }

    try {
      const job = await dbUtils.getJobById(params.id as string);
      if (!job) {
        return HttpResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(job);
    } catch (error) {
      return createErrorResponse("Database error while fetching job");
    }
  }),

  http.post("/api/jobs", async ({ request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to create job");
    }

    try {
      const jobData = await request.json() as Omit<Job, "id" | "slug" | "createdAt" | "updatedAt" | "order">;
      const newJob = await dbUtils.createJob(jobData);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      return createErrorResponse("Database error while creating job");
    }
  }),

  http.patch("/api/jobs/:id", async ({ params, request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to update job");
    }

    try {
      const updates = await request.json() as Partial<Job>;
      const updatedJob = await dbUtils.updateJob(params.id as string, updates);
      if (!updatedJob) {
        return HttpResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return createErrorResponse("Database error while updating job");
    }
  }),

  http.delete("/api/jobs/:id", async ({ params }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to delete job");
    }

    try {
      const deleted = await dbUtils.deleteJob(params.id as string);
      if (!deleted) {
        return HttpResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json({ success: true });
    } catch (error) {
      return createErrorResponse("Database error while deleting job");
    }
  }),

  http.patch("/api/jobs/reorder", async ({ request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to reorder jobs");
    }

    try {
      const { jobIds } = await request.json() as { jobIds: string[] };
      await dbUtils.reorderJobs(jobIds);
      return HttpResponse.json({ success: true });
    } catch (error) {
      return createErrorResponse("Database error while reordering jobs");
    }
  }),

  // Candidates API
  http.get("/api/candidates", async ({ request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to fetch candidates");
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const stage = url.searchParams.get("stage") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    try {
      const allCandidates = await dbUtils.getAllCandidates();
      
      // Filter candidates
      let filteredCandidates = allCandidates;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower)
        );
      }
      
      if (stage !== "all") {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.stage === stage);
      }
      
      // Paginate
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
      
      return HttpResponse.json({
        candidates: paginatedCandidates,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: filteredCandidates.length,
          totalPages: Math.ceil(filteredCandidates.length / pageSize)
        }
      });
    } catch (error) {
      return createErrorResponse("Database error while fetching candidates");
    }
  }),

  http.get("/api/candidates/:id", async ({ params }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to fetch candidate");
    }

    try {
      const candidate = await dbUtils.getCandidateById(params.id as string);
      if (!candidate) {
        return HttpResponse.json(
          { error: "Candidate not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(candidate);
    } catch (error) {
      return createErrorResponse("Database error while fetching candidate");
    }
  }),

  http.patch("/api/candidates/:id", async ({ params, request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to update candidate");
    }

    try {
      const updates = await request.json() as Partial<Candidate>;
      const updatedCandidate = await dbUtils.updateCandidate(params.id as string, updates);
      if (!updatedCandidate) {
        return HttpResponse.json(
          { error: "Candidate not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return createErrorResponse("Database error while updating candidate");
    }
  }),

  http.post("/api/candidates/:id/notes", async ({ params, request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to add note");
    }

    try {
      const noteData = await request.json() as { content: string; createdBy?: string };
      const newNote = await dbUtils.addCandidateNote(params.id as string, {
        content: noteData.content,
        createdBy: noteData.createdBy || "user@company.com"
      });
      if (!newNote) {
        return HttpResponse.json(
          { error: "Candidate not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(newNote, { status: 201 });
    } catch (error) {
      return createErrorResponse("Database error while adding note");
    }
  }),

  // Assessments API
  http.get("/api/assessments", async () => {
    await addLatency();
    
    // if (shouldFail()) {
    //   return createErrorResponse("Failed to fetch assessments");
    // }

    try {
      const assessments = await db.assessments.toArray();
      return HttpResponse.json(assessments);
    } catch (error) {
      return createErrorResponse("Database error while fetching assessments");
    }
  }),

  http.get("/api/assessments/:jobId", async ({ params }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to fetch assessment");
    }

    try {
      const assessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
      if (!assessment) {
        return HttpResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json(assessment);
    } catch (error) {
      return createErrorResponse("Database error while fetching assessment");
    }
  }),

  http.put("/api/assessments/:jobId", async ({ params, request }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to save assessment");
    }

    try {
      const assessment = await request.json() as Assessment;
      const savedAssessment = await dbUtils.saveAssessment(assessment);
      return HttpResponse.json(savedAssessment);
    } catch (error) {
      return createErrorResponse("Database error while saving assessment");
    }
  }),

  http.delete("/api/assessments/:jobId", async ({ params }) => {
    await addLatency();
    
    if (shouldFail()) {
      return createErrorResponse("Failed to delete assessment");
    }

    try {
      const deleted = await dbUtils.deleteAssessment(params.jobId as string);
      if (!deleted) {
        return HttpResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }
      return HttpResponse.json({ success: true });
    } catch (error) {
      return createErrorResponse("Database error while deleting assessment");
    }
  }),
];
