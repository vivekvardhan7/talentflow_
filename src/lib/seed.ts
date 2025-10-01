﻿import { dbUtils, db } from "./database";
import candidatesDataRaw from "../data/candidates.json";
import jobsDataRaw from "../data/jobs.json";
import assignmentsDataRaw from "../data/assignments.json";
import { Candidate, Job, Assessment } from "./database";

const candidatesData = candidatesDataRaw as Candidate[];
const jobsData = jobsDataRaw as Job[];
const assignmentsData = assignmentsDataRaw as Assessment[];

export const seedCandidates = async (): Promise<void> => {
  try {
    // Check if candidates already exist
    const existingCandidates = await dbUtils.getAllCandidates();
    
    if (existingCandidates.length === 0) {
      console.log("Seeding candidates database...");
      // Transform names and avatars for a fresh set of identities
      const indianNames = [
        "Aarav Shah", "Isha Kapoor", "Kabir Menon", "Zara Khan", "Vivaan Patel",
        "Anaya Reddy", "Reyansh Gupta", "Diya Nair", "Arjun Verma", "Mira Joshi",
        "Ibrahim Ali", "Sara Chawla", "Rohan Mehta", "Anika Singh", "Kian Roy",
        "Aisha Fernandes", "Dev Malhotra", "Naina Banerjee", "Arnav Das", "Ria Sinha",
        "Vikram Iyer", "Leah Mathews", "Neil Dutta", "Myra Bhat", "Ira Kulkarni",
        "Advait Rao", "Kiara Desai", "Ayaan Bose", "Meera Pillai", "Kabir Gill"
      ];
      const germanNames = [
        "Lukas Müller", "Mia Schneider", "Leon Fischer", "Emma Weber", "Noah Wagner",
        "Hannah Becker", "Ben Hoffmann", "Lina Schäfer", "Elias Koch", "Emilia Bauer",
        "Finn Richter", "Sophia Klein", "Paul Wolf", "Lena Neumann", "Jonas Schröder",
        "Lea Zimmermann", "Max Vogel", "Marie Hartmann", "Felix Krüger", "Clara Braun",
        "Nico Weiß", "Nina König", "Timo Schäfer", "Julia Frank", "Marco Lehmann",
        "Sarah Albrecht", "Jan Schmitt", "Laura Fuchs", "Tobias Brandt", "Klara Keller"
      ];
      const replacementNames = indianNames.concat(germanNames);
      const transformed = candidatesData.map((c, idx) => {
        const name = replacementNames[idx % replacementNames.length];
        // Use a stable avatar source; pravatar has 70 images
        const avatar = `https://i.pravatar.cc/150?img=${(idx % 70) + 1}`;
        return { ...c, name, avatar } as Candidate;
      });
      await dbUtils.seedCandidates(transformed);
      console.log(`Seeded ${candidatesData.length} candidates`);
    } else {
      console.log(`Database already contains ${existingCandidates.length} candidates`);
    }
  } catch (error) {
    console.error("Error seeding candidates:", error);
    throw error;
  }
};

export const seedJobs = async (): Promise<void> => {
  try {
    // Check if jobs already exist
    const existingJobs = await dbUtils.getAllJobs();
    
    if (existingJobs.length === 0) {
      console.log("Seeding jobs database...");
      await dbUtils.seedJobs(jobsData);
      console.log(`Seeded ${jobsData.length} jobs`);
    } else {
      console.log(`Database already contains ${existingJobs.length} jobs`);
    }
  } catch (error) {
    console.error("Error seeding jobs:", error);
    throw error;
  }
};

export const seedAssessments = async (): Promise<void> => {
  try {
    console.log("[SEED] Starting assessment seeding process...");
    
    // Check if our specific assignments from assignments.json already exist
    const existingAssessments = await dbUtils.getAllAssessments();
    console.log(`[SEED] Found ${existingAssessments.length} existing assessments:`, existingAssessments.map(a => ({ id: a.id, title: a.title })));
    
    const assignmentIds = assignmentsData.map(a => a.id);
    console.log(`[SEED] Assignment IDs from JSON:`, assignmentIds);
    
    const existingAssignmentIds = existingAssessments.map(a => a.id);
    const hasOurAssignments = assignmentIds.every(id => existingAssignmentIds.includes(id));
    
    console.log(`[SEED] Has our assignments already? ${hasOurAssignments}`);
    
    if (!hasOurAssignments) {
      console.log("[SEED] Clearing existing assessments and seeding with assignments.json data...");
      // Clear existing assessments and seed with our assignment data
      await db.assessments.clear();
      await dbUtils.seedAssessments(assignmentsData);
      console.log(`[SEED] Successfully seeded ${assignmentsData.length} assessments from assignments.json`);
      
      // Verify seeding worked
      const newAssessments = await dbUtils.getAllAssessments();
      console.log(`[SEED] Verification: Database now contains ${newAssessments.length} assessments:`, newAssessments.map(a => ({ id: a.id, title: a.title })));
    } else {
      console.log(`[SEED] Database already contains all ${assignmentsData.length} assignments from assignments.json`);
    }
  } catch (error) {
    console.error("[SEED] Error seeding assessments:", error);
    throw error;
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("[INIT] Starting database initialization...");
    await Promise.all([
      seedCandidates(),
      seedJobs(),
      seedAssessments()
    ]);
    console.log("[INIT] Database initialization completed successfully");
  } catch (error) {
    console.error("[INIT] Error initializing database:", error);
    throw error;
  }
};

// Utility function to force reseed assessments
export const forceReseedAssessments = async (): Promise<void> => {
  try {
    console.log("[FORCE-RESEED] Forcing assessment reseed...");
    await db.assessments.clear();
    await dbUtils.seedAssessments(assignmentsData);
    console.log(`[FORCE-RESEED] Successfully reseeded ${assignmentsData.length} assessments`);
  } catch (error) {
    console.error("[FORCE-RESEED] Error force reseeding assessments:", error);
    throw error;
  }
};

// Utility function to force reseed candidates with new names/avatars
export const forceReseedCandidates = async (): Promise<void> => {
  try {
    console.log("[FORCE-RESEED] Forcing candidates reseed with new names/avatars...");
    await db.candidates.clear();
    await seedCandidates();
    const count = (await dbUtils.getAllCandidates()).length;
    console.log(`[FORCE-RESEED] Successfully reseeded ${count} candidates`);
  } catch (error) {
    console.error("[FORCE-RESEED] Error force reseeding candidates:", error);
    throw error;
  }
};
