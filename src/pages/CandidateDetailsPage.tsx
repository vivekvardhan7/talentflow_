﻿import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  selectCurrentCandidate,
  selectCandidatesLoading,
  selectCandidatesError,
  clearError
} from "@/features/candidates/candidatesSlice";
import { fetchCandidateById, addCandidateNote } from "@/features/candidates/thunks/candidatesThunks";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch } from "@/store";

const CandidateDetailsPage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const candidate = useSelector(selectCurrentCandidate);
  const loading = useSelector(selectCandidatesLoading);
  const error = useSelector(selectCandidatesError);
  const [newNote, setNewNote] = React.useState("");

  // Load candidate details on component mount
  useEffect(() => {
    if (candidateId) {
      dispatch(fetchCandidateById(candidateId) as any);
    }
  }, [dispatch, candidateId]);

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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    dispatch(addCandidateNote({
      candidateId: candidateId!,
      note: {
        content: newNote,
        createdBy: "user@company.com"
      }
    }) as any);

    setNewNote("");
    toast({
      title: "Note added",
      description: "Note has been added to candidate profile."
    });
  };

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

  if (loading && !candidate) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Loading candidate details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate && !loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Candidate not found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">The candidate you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/candidates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="p-2 sm:px-3">
            <Link to="/candidates">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Candidates</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </div>
        
        {/* Profile header - mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-16 w-16 sm:h-12 sm:w-12 flex-shrink-0">
              <AvatarImage src={candidate?.avatar} alt={candidate?.name} />
              <AvatarFallback>{getInitials(candidate?.name || "")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{candidate?.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground truncate">{candidate?.email}</p>
            </div>
          </div>
          <div className="flex-shrink-0 self-start sm:self-center">
            <Badge className={`${getStageColor(candidate?.stage || "")} text-xs sm:text-sm`}>
              {candidate?.stage}
            </Badge>
          </div>
        </div>
      </div>

      {/* Side-by-side layout: main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base truncate">{candidate?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base">{candidate?.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base">{candidate?.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  Applied on {candidate?.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Skills & Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Experience Level</p>
                <p className="font-medium text-sm sm:text-base">{candidate?.experience}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate?.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Timeline</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Activity history for this candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {candidate?.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">{event.message}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()} by {event.createdBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Add Note */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Add Note</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Add a note to this candidate's profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-3 sm:space-y-4">
                <Textarea
                  placeholder="Add a note about this candidate..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="text-sm sm:text-base"
                />
                <Button type="submit" className="w-full text-sm sm:text-base" disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Notes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Internal notes about this candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {candidate?.notes && candidate.notes.length > 0 ? (
                  candidate.notes.map((note, index) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg">
                      <p className="text-xs sm:text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.createdAt).toLocaleString()} by {note.createdBy}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs sm:text-sm">No notes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
