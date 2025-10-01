﻿﻿﻿﻿﻿import Dexie, { Table } from "dexie";

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "active" | "draft" | "archived";
  tags: string[];
  location: string;
  type: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  createdBy: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobId: string;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
  avatar: string;
  location: string;
  experience: string;
  skills: string[];
  appliedAt: string;
  notes: Note[];
  timeline: TimelineEvent[];
}

export interface Question {
  id: string;
  type: "short_text" | "long_text" | "single_choice" | "multi_choice" | "numeric_range" | "file_upload";
  title: string;
  description: string;
  required: boolean;
  options: string[];
  correctAnswer?: string | string[]; // For single choice: string, for multi choice: string[]
  validation: Record<string, any>;
  conditionalLogic: any;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  order: number;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

class TalentFlowDatabase extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;

  constructor() {
    super("TalentFlowDatabase");
    this.version(1).stores({
      jobs: "id, title, status, order, createdAt",
      candidates: "id, name, email, jobId, stage, appliedAt",
      assessments: "id, jobId, createdAt, updatedAt"
    });
  }
}

export const db = new TalentFlowDatabase();

// Utility functions for database operations
export const dbUtils = {
  // Jobs
  async getAllJobs(): Promise<Job[]> {
    return await db.jobs.orderBy("order").toArray();
  },

  async getJobById(id: string): Promise<Job | undefined> {
    return await db.jobs.get(id);
  },

  async createJob(job: Omit<Job, "id" | "slug" | "createdAt" | "updatedAt" | "order">): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      slug: job.title.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: await db.jobs.count()
    };
    await db.jobs.add(newJob);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = await db.jobs.get(id);
    if (job) {
      const updatedJob = { ...job, ...updates, updatedAt: new Date().toISOString() };
      await db.jobs.put(updatedJob);
      return updatedJob;
    }
    return undefined;
  },

  async deleteJob(id: string): Promise<boolean> {
    try {
      await db.jobs.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async reorderJobs(jobIds: string[]): Promise<void> {
    const jobs = await db.jobs.bulkGet(jobIds);
    const updates = jobs.map((job, index) => ({
      ...job!,
      order: index,
      updatedAt: new Date().toISOString()
    }));
    await db.jobs.bulkPut(updates);
  },

  async seedJobs(jobs: Job[]): Promise<void> {
    await db.jobs.bulkPut(jobs);
  },

  // Candidates
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.candidates.toArray();
  },

  async getCandidateById(id: string): Promise<Candidate | undefined> {
    return await db.candidates.get(id);
  },

  async getCandidatesByJob(jobId: string): Promise<Candidate[]> {
    return await db.candidates.where("jobId").equals(jobId).toArray();
  },

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    console.log('dbUtils.updateCandidate called with:', { id, updates });
    const candidate = await db.candidates.get(id);
    console.log('Found candidate:', candidate);
    if (candidate) {
      const updatedCandidate = { ...candidate, ...updates };
      console.log('Updating candidate to:', updatedCandidate);
      await db.candidates.put(updatedCandidate);
      console.log('Candidate updated successfully in database');
      return updatedCandidate;
    }
    console.log('Candidate not found in database');
    return undefined;
  },

  async addCandidateNote(candidateId: string, note: Omit<Note, "id" | "createdAt">): Promise<Note | undefined> {
    const candidate = await db.candidates.get(candidateId);
    if (candidate) {
      const newNote: Note = {
        ...note,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      candidate.notes.push(newNote);
      await db.candidates.put(candidate);
      return newNote;
    }
    return undefined;
  },

  async seedCandidates(candidates: Candidate[]): Promise<void> {
    await db.candidates.bulkPut(candidates);
  },

  // Assessments
  async getAllAssessments(): Promise<Assessment[]> {
    return await db.assessments.toArray();
  },

  async getAssessmentByJobId(jobId: string): Promise<Assessment | undefined> {
    return await db.assessments.where("jobId").equals(jobId).first();
  },

  async saveAssessment(assessment: Assessment): Promise<Assessment> {
    await db.assessments.put(assessment);
    return assessment;
  },

  async deleteAssessment(jobId: string): Promise<boolean> {
    try {
      await db.assessments.where("jobId").equals(jobId).delete();
      return true;
    } catch {
      return false;
    }
  },

  async seedAssessments(assessments: Assessment[]): Promise<void> {
    await db.assessments.bulkPut(assessments);
  }
};
