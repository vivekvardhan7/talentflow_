import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, FileText, Calendar, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  selectAllAssessments,
  selectAssessmentsLoading,
  selectAssessmentsError,
  clearError
} from "@/features/assessments/assessmentsSlice";
import { selectJobs } from "@/features/jobs/jobsSlice";
import { fetchAllAssessments, deleteAssessment } from "@/features/assessments/thunks/assessmentsThunks";
import { fetchJobs } from "@/features/jobs/thunks/jobsThunks";
import { AppDispatch } from "@/store";

const AssessmentsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assessments = useSelector(selectAllAssessments);
  const loading = useSelector(selectAssessmentsLoading);
  const error = useSelector(selectAssessmentsError);
  const jobs = useSelector(selectJobs);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobSearchTerm, setJobSearchTerm] = useState("");

  // Load assessments and jobs on component mount
  useEffect(() => {
    dispatch(fetchAllAssessments());
    dispatch(fetchJobs({}));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Create a map of jobs for quick lookup
  const jobsMap = React.useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc[job.id] = job;
      return acc;
    }, {} as Record<string, any>);
  }, [jobs]);

  // Filter assessments based on search and status
  const filteredAssessments = React.useMemo(() => {
    return assessments.filter(assessment => {
      const job = jobsMap[assessment.jobId];
      const matchesSearch = !searchTerm || 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job && job.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && job?.status === "active") ||
        (statusFilter === "draft" && job?.status === "draft");
      
      return matchesSearch && matchesStatus;
    });
  }, [assessments, searchTerm, statusFilter, jobsMap]);

  // Filter jobs for the create modal
  const filteredJobs = React.useMemo(() => {
    const existingJobIds = new Set(assessments.map(a => a.jobId));
    
    const availableJobs = jobs.filter(job => {
      const matchesSearch = !jobSearchTerm || 
        job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(jobSearchTerm.toLowerCase());
      
      // Show all jobs that don't already have assessments (regardless of status)
      const hasNoAssessment = !existingJobIds.has(job.id);
      
      return matchesSearch && hasNoAssessment;
    });
    
    return availableJobs;
  }, [jobs, jobSearchTerm, assessments]);

  const handleCreateAssessment = () => {
    if (!selectedJobId) {
      toast({
        title: "Error",
        description: "Please select a job to create an assessment for.",
        variant: "destructive"
      });
      return;
    }

    setIsCreateModalOpen(false);
    setSelectedJobId("");
    setJobSearchTerm("");
    navigate(`/assessments/${selectedJobId}`);
  };

  const handleDeleteAssessment = async (assessmentId: string, jobId: string) => {
    try {
      await dispatch(deleteAssessment(jobId)).unwrap();
      // Refresh the assessments list after successful deletion
      dispatch(fetchAllAssessments());
      toast({
        title: "Assessment deleted",
        description: "Assessment has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (jobId: string) => {
    const job = jobsMap[jobId];
    if (!job) return null;

    const statusColors = {
      active: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={statusColors[job.status as keyof typeof statusColors]}>
        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
      </Badge>
    );
  };

  if (loading && assessments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Manage candidate assessments and questionnaires</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Select a job to create an assessment for. Only jobs without existing assessments are shown.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <Input
                  placeholder="Search jobs..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  className="mb-4"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedJobId === job.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {job.department} • {job.location} • {job.type}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.tags.slice(0, 3).map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {job.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            job.status === "active" ? "bg-green-100 text-green-800" :
                            job.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                          {selectedJobId === job.id && (
                            <div className="w-4 h-4 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No available jobs found.</p>
                    <p className="text-sm">All jobs may already have assessments or try adjusting your search.</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedJobId("");
                  setJobSearchTerm("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateAssessment}
                disabled={!selectedJobId}
              >
                Create Assessment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Jobs</SelectItem>
            <SelectItem value="draft">Draft Jobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        {filteredAssessments.length > 0 ? (
          filteredAssessments.map((assessment) => {
            const job = jobsMap[assessment.jobId];
            
            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assessment.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {job ? `${job.title} • ${job.department}` : "Unknown Job"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assessment.jobId)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/assessments/${assessment.jobId}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View/Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteAssessment(assessment.id, assessment.jobId)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {assessment.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {assessment.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {assessment.sections.length} sections
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs">
                      Last updated {new Date(assessment.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first assessment."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Assessment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsPage;