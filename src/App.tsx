import React from 'react';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailsPage from './pages/CandidateDetailsPage';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage';
import AssessmentsPage from './pages/AssessmentsPage';
import TubelightNavbarDemo from './pages/TubelightNavbarDemo';
import NotFound from './pages/NotFound';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <SidebarProvider>
                <div className="flex">
                  <Navigation />
                  <SidebarInset className="p-4">
                    <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                  <Route path="/candidates" element={<CandidatesPage />} />
                  <Route path="/candidates/:candidateId" element={<CandidateDetailsPage />} />
                  <Route path="/assessments" element={<AssessmentsPage />} />
                  <Route path="/assessments/:jobId" element={<AssessmentBuilderPage />} />
                  <Route path="/tubelight-demo" element={<TubelightNavbarDemo />} />
                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
