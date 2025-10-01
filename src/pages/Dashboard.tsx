﻿﻿﻿﻿﻿﻿﻿﻿﻿import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, Users, FileText, TrendingUp, Building, User, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { selectJobs, selectJobsLoading, selectJobsPagination } from '@/features/jobs/jobsSlice';
import { selectCandidates, selectCandidatesLoading, selectCandidatesPagination } from '@/features/candidates/candidatesSlice';
import { selectAllAssessments, selectAssessmentsLoading } from '@/features/assessments/assessmentsSlice';
import { fetchJobs } from '@/features/jobs/thunks/jobsThunks';
import { fetchCandidates } from '@/features/candidates/thunks/candidatesThunks';
import { fetchAllAssessments } from '@/features/assessments/thunks/assessmentsThunks';
import { AppDispatch } from '@/store';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector(selectJobs);
  const candidates = useSelector(selectCandidates);
  const allAssessments = useSelector(selectAllAssessments);
  const jobsLoading = useSelector(selectJobsLoading);
  const candidatesLoading = useSelector(selectCandidatesLoading);
  const assessmentsLoading = useSelector(selectAssessmentsLoading);
  const jobsPagination = useSelector(selectJobsPagination);
  const candidatesPagination = useSelector(selectCandidatesPagination);

  useEffect(() => {
    // For dashboard stats, we need all data, not paginated
    dispatch(fetchJobs({ pageSize: 1000 }) as any); // Get all jobs
    dispatch(fetchCandidates({ pageSize: 1000 }) as any); // Get all candidates
    dispatch(fetchAllAssessments() as any);
  }, [dispatch]);

  // Debug logging to see what data we're getting
  console.log('Dashboard Data:', {
    jobs: jobs.length,
    candidates: candidates.length,
    assessments: allAssessments.length,
    jobsTotal: jobsPagination.totalItems,
    candidatesTotal: candidatesPagination.totalItems,
    jobsLoading,
    candidatesLoading,
    assessmentsLoading
  });

  // Show loading state if any data is still loading
  if (jobsLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics using total counts from pagination
  const totalJobs = jobsPagination.totalItems || jobs.length;
  const totalCandidates = candidatesPagination.totalItems || candidates.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const newCandidatesThisWeek = candidates.filter(candidate => {
    const appliedDate = new Date(candidate.appliedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return appliedDate >= weekAgo;
  }).length;
  const hiredCandidates = candidates.filter(candidate => candidate.stage === 'hired').length;
  const assessmentTemplates = allAssessments.length; // Real count from IndexedDB
  const successRate = totalCandidates > 0 ? Math.round((hiredCandidates / totalCandidates) * 100) : 0;

  // Get recent jobs (last 4)
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 4)
    .map((job, index) => ({
      ...job,
      candidateCount: Math.floor(Math.random() * 50) + 20, // Mock candidate counts
      date: '9/16/2025'
    }));

  // Get recent candidates (last 4)
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 4)
    .map(candidate => ({
      ...candidate,
      date: '9/16/2025'
    }));

  // Get recent assessments (last 4) from IndexedDB
  const recentAssessments = [...allAssessments]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 4)
    .map(assessment => ({
      id: assessment.id,
      name: assessment.title,
      sections: assessment.sections.length,
      date: new Date(assessment.createdAt).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      })
    }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Archived</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>;
    }
  };

  const getCandidateStatusBadge = (stage: string) => {
    switch (stage) {
      case 'screen':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Screen</Badge>;
      case 'hired':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Hired</Badge>;
      case 'applied':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Applied</Badge>;
      case 'offer':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Offer</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Applied</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Jobs */}
          <Card className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Jobs
              </CardTitle>
              <Building className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalJobs}</div>
              <p className="text-xs text-green-400 mt-1">
                ↗ {activeJobs} active
              </p>
            </CardContent>
          </Card>

          {/* Total Candidates */}
          <Card className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCandidates}</div>
              <p className="text-xs text-green-400 mt-1">
                ↗ +{newCandidatesThisWeek} this week
              </p>
            </CardContent>
          </Card>

          {/* Assessment Templates */}
          <Card className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assessment Templates
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{assessmentTemplates}</div>
              <p className="text-xs text-blue-400 mt-1">
                {assessmentTemplates > 0 ? `🔵 Ready to use` : `📝 Create templates`}
              </p>
            </CardContent>
          </Card>

          {/* Hired Candidates */}
          <Card className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hired Candidates
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{hiredCandidates}</div>
              <p className="text-xs text-green-400 mt-1">
                ✓ {successRate}% success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <Card className="border border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg">Recent Jobs</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Your latest job postings and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.map((job, index) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      job.status === 'active' ? 'bg-green-400' :
                      job.status === 'draft' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.location} • {job.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.candidateCount} candidates
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(job.status)}
                    <p className="text-xs text-muted-foreground mt-1">{job.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card className="border border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                <CardTitle className="text-lg">Recent Candidates</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Latest candidate applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCandidates.map((candidate, index) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      candidate.stage === 'hired' ? 'bg-green-400' :
                      candidate.stage === 'screen' ? 'bg-yellow-400' :
                      candidate.stage === 'applied' ? 'bg-orange-400' :
                      candidate.stage === 'offer' ? 'bg-blue-400' :
                      'bg-blue-400'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      <p className="text-xs text-muted-foreground">
                        QA Engineer
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getCandidateStatusBadge(candidate.stage)}
                    <p className="text-xs text-muted-foreground mt-1">{candidate.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assessments */}
          <Card className="border border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-lg">Assessments</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Available assessment templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment, index) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{assessment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {assessment.sections} sections
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                       Template
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{assessment.date}</p>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assessments yet. Create your first assessment template!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
