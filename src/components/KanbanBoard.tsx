﻿﻿﻿import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  selectCandidatesByStage,
  selectCandidatesLoading,
  selectCandidatesError,
  clearError
} from "@/features/candidates/candidatesSlice";
import { updateCandidateStage, fetchCandidatesByJob } from "@/features/candidates/thunks/candidatesThunks";
import { RootState } from "@/store";
import { Link } from "react-router-dom";

interface KanbanBoardProps {
  jobId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ jobId }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const candidatesByStage = useSelector((state: RootState) => selectCandidatesByStage(state, jobId));
  const loading = useSelector(selectCandidatesLoading);
  const error = useSelector(selectCandidatesError);

  // Load candidates for this specific job on component mount
  useEffect(() => {
    console.log('KanbanBoard loading candidates for job:', jobId);
    dispatch(fetchCandidatesByJob(jobId) as any);
  }, [dispatch, jobId]);

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

  const stages = [
    { id: "applied", title: "Applied", color: "bg-blue-100 text-blue-800" },
    { id: "screen", title: "Screening", color: "bg-yellow-100 text-yellow-800" },
    { id: "tech", title: "Technical", color: "bg-purple-100 text-purple-800" },
    { id: "offer", title: "Offer", color: "bg-orange-100 text-orange-800" },
    { id: "hired", title: "Hired", color: "bg-green-100 text-green-800" },
    { id: "rejected", title: "Rejected", color: "bg-red-100 text-red-800" }
  ];

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      console.log('Updating candidate stage:', {
        candidateId: draggableId,
        newStage: destination.droppableId,
        movedBy: "user@company.com"
      });

      const result = await dispatch(updateCandidateStage({
        candidateId: draggableId,
        newStage: destination.droppableId as any,
        movedBy: "user@company.com"
      }) as any);

      console.log('Update candidate stage result:', result);

      if (updateCandidateStage.fulfilled.match(result)) {
        toast({
          title: "Candidate moved",
          description: `Candidate moved to ${stages.find(s => s.id === destination.droppableId)?.title}`
        });
      } else {
        console.error('Failed to update candidate stage:', result);
        toast({
          title: "Error",
          description: "Failed to update candidate stage",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      toast({
        title: "Error",
        description: "Failed to update candidate stage",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Candidate Pipeline</h2>
        <p className="text-muted-foreground">
          Drag candidates between stages to update their status
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {stage.title}
                </h3>
                <Badge className={`${stage.color} text-xs`}>
                  {candidatesByStage[stage.id]?.length || 0}
                </Badge>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25"
                    }`}
                  >
                    {candidatesByStage[stage.id]?.map((candidate, index) => (
                      <Draggable
                        key={candidate.id}
                        draggableId={candidate.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 cursor-grab hover:shadow-md transition-all ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : ""
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(candidate.name)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">
                                    {candidate.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {candidate.email}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {candidate.skills.slice(0, 2).map((skill, skillIndex) => (
                                      <Badge
                                        key={skillIndex}
                                        variant="secondary"
                                        className="text-xs px-1 py-0"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                    {candidate.skills.length > 2 && (
                                      <Badge variant="secondary" className="text-xs px-1 py-0">
                                        +{candidate.skills.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-2 border-t">
                                <Link
                                  to={`/candidates/${candidate.id}`}
                                  className="text-xs text-primary hover:text-primary/80 font-medium"
                                >
                                  View Details 
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {(!candidatesByStage[stage.id] || candidatesByStage[stage.id].length === 0) && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        No candidates in this stage
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
