﻿import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize database and render app
async function initializeApp() {
  try {
    // Initialize database with seed data
    const { initializeDatabase, forceReseedAssessments, forceReseedCandidates } = await import("./lib/seed");
    await initializeDatabase();
    console.log("Database initialized successfully");

    // Make force reseed function available globally for debugging
    (window as any).forceReseedAssessments = forceReseedAssessments;
    (window as any).forceReseedCandidates = forceReseedCandidates;
    console.log("Debug: Run window.forceReseedAssessments() or window.forceReseedCandidates() in console to reseed");

    // Render the app
    createRoot(document.getElementById("root")!).render(<App />);
  } catch (error) {
    console.error("Failed to initialize app:", error);
    // Render the app anyway, even if database fails
    createRoot(document.getElementById("root")!).render(<App />);
  }
}

initializeApp();
