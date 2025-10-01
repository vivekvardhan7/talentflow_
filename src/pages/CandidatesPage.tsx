﻿import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, User, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  selectCandidates,
  selectCandidatesLoading,
  selectCandidatesError,
  selectCandidatesFilters,
  selectCandidatesPagination,
  setFilters,
  setPagination,
  clearError
} from "@/features/candidates/candidatesSlice";
import { selectJobs } from "@/features/jobs/jobsSlice";
import { fetchCandidates } from "@/features/candidates/thunks/candidatesThunks";
import { RootState, AppDispatch } from "@/store";
import { Link } from "react-router-dom";
import Pagination from "@/components/Pagination";

const CandidatesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const candidates = useSelector(selectCandidates);
  const loading = useSelector(selectCandidatesLoading);
  const error = useSelector(selectCandidatesError);
  const filters = useSelector(selectCandidatesFilters);
  const pagination = useSelector(selectCandidatesPagination);
  const jobs = useSelector(selectJobs);

  const jobsMap = useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc[job.id] = job;
      return acc;
    }, {} as Record<string, any>);
  }, [jobs]);

  // Load candidates on component mount and when filters change
  useEffect(() => {
    dispatch(fetchCandidates(filters) as any);
  }, [dispatch, filters]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Candidates error:", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "applied": return "bg-blue-100 text-blue-800";
      case "screen": return "bg-yellow-100 text-yellow-800";
      case "tech": return "bg-purple-100 text-purple-800";
      case "offer": return "bg-orange-100 text-orange-800";
      case "hired": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Candidates</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your talent pipeline</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search candidates..."
            value={filters.search || ""}
            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            className="pl-10 h-10 sm:h-9"
          />
        </div>
        <Select
          value={filters.stage || "all"}
          onValueChange={(value) => dispatch(setFilters({ stage: value }))}
        >
          <SelectTrigger className="w-full sm:w-48 h-10 sm:h-9">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screen">Screening</SelectItem>
            <SelectItem value="tech">Technical</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates List - side-by-side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
        {candidates.map((candidate) => {
          const job = jobsMap[candidate.jobId];
          
          return (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow h-full overflow-hidden">
              <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                  {/* Left column: Avatar + primary info + meta */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground truncate break-words">{candidate.email}</p>
                          </div>
                          <Badge className={`${getStageColor(candidate.stage)} flex-shrink-0`}>{candidate.stage}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Meta: Location, Experience, Job */}
                    <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate break-words">{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate break-words">{candidate.experience}</span>
                      </div>
                      {job && (
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate break-words">{job.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right column: Skills + CTA */}
                  <div className="flex flex-col gap-3 justify-between min-w-0">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidate.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                    <div className="pt-1 sm:pt-2">
                      <Link
                        to={`/candidates/${candidate.id}`}
                        className="inline-block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {candidates.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            {filters.search || filters.stage !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "Candidates will appear here when they apply for your jobs."
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 sm:mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => {
              dispatch(setFilters({ page }));
              dispatch(setPagination({ currentPage: page }));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
