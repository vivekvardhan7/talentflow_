﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Plus, Trash2, Save, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  selectAssessmentByJobId,
  selectAssessmentsLoading,
  selectAssessmentsError,
  clearError
} from "@/features/assessments/assessmentsSlice";
import { fetchAssessmentByJobId, saveAssessment } from "@/features/assessments/thunks/assessmentsThunks";
import { Assessment, Section, Question } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch } from "@/store";
import AssessmentPreview from "@/components/AssessmentPreview";

const AssessmentBuilderPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const assessment = useSelector((state: any) => selectAssessmentByJobId(state, jobId!));
  const loading = useSelector(selectAssessmentsLoading);
  const error = useSelector(selectAssessmentsError);

  const [localAssessment, setLocalAssessment] = useState<Assessment | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load assessment on component mount
  useEffect(() => {
    if (jobId) {
      dispatch(fetchAssessmentByJobId(jobId));
    }
  }, [dispatch, jobId]);

  // Update local assessment when fetched
  useEffect(() => {
    if (assessment) {
      setLocalAssessment(assessment);
    } else if (jobId) {
      // Create new assessment if none exists
      const newAssessment: Assessment = {
        id: `assessment-${jobId}`,
        jobId,
        title: "New Assessment",
        description: "",
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLocalAssessment(newAssessment);
    }
  }, [assessment, jobId]);

  // Handle errors - removed error toast as requested
  useEffect(() => {
    if (error) {
      // Remove error toast display
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const addSection = () => {
    if (!localAssessment) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "New Section",
      description: "",
      questions: [],
      order: localAssessment.sections.length
    };

    setLocalAssessment({
      ...localAssessment,
      sections: [...localAssessment.sections, newSection],
      updatedAt: new Date().toISOString()
    });
    setHasChanges(true);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!localAssessment) return;

    setLocalAssessment({
      ...localAssessment,
      sections: localAssessment.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      updatedAt: new Date().toISOString()
    });
    setHasChanges(true);
  };

  const removeSection = (sectionId: string) => {
    if (!localAssessment) return;

    setLocalAssessment({
      ...localAssessment,
      sections: localAssessment.sections.filter(section => section.id !== sectionId),
      updatedAt: new Date().toISOString()
    });
    setHasChanges(true);
  };

  const addQuestion = (sectionId: string) => {
    if (!localAssessment) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: "short_text",
      title: "New Question",
      description: "",
      required: false,
      options: [],
      correctAnswer: undefined,
      validation: {},
      conditionalLogic: null,
      order: 0
    };

    setLocalAssessment({
      ...localAssessment,
      sections: localAssessment.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      ),
      updatedAt: new Date().toISOString()
    });
    setHasChanges(true);
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    if (!localAssessment) return;

    setLocalAssessment({
      ...localAssessment,
      sections: localAssessment.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === questionId ? { ...question, ...updates } : question
              )
            }
          : section
      ),
      updatedAt: new Date().toISOString()
    });
    setHasChanges(true);
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    if (!localAssessment) return;

    setLocalAssessment({
      ...localAssessment,
      sections: localAssessment.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      ),
      updatedAt: new Date().toISOString()
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!localAssessment || !jobId) return;

    dispatch(saveAssessment({ jobId, assessment: localAssessment }));
    setHasChanges(false);
    toast({
      title: "Assessment saved",
      description: "Assessment has been saved successfully."
    });
  };

  if (loading && !localAssessment) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!localAssessment) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Assessment not found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">The assessment you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
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
            <Link to={`/jobs/${jobId}`}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Job</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </div>
        
        {/* Title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Assessment Builder</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Create and customize assessment questions</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {hasChanges && (
              <span className="text-xs sm:text-sm text-muted-foreground">Unsaved changes</span>
            )}
            <Button onClick={handleSave} disabled={loading || !hasChanges} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for Builder and Preview */}
      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full max-w-sm sm:max-w-md grid-cols-2 mb-4 sm:mb-6">
          <TabsTrigger value="builder" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Builder</span>
            <span className="sm:hidden">Build</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Live Preview</span>
            <span className="sm:hidden">Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-4 sm:space-y-6">
          {/* Assessment Details */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm sm:text-base">Title</Label>
                <Input
                  id="title"
                  value={localAssessment.title}
                  onChange={(e) => setLocalAssessment({
                    ...localAssessment,
                    title: e.target.value,
                    updatedAt: new Date().toISOString()
                  })}
                  placeholder="Assessment title"
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                <Textarea
                  id="description"
                  value={localAssessment.description}
                  onChange={(e) => setLocalAssessment({
                    ...localAssessment,
                    description: e.target.value,
                    updatedAt: new Date().toISOString()
                  })}
                  placeholder="Assessment description"
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4 sm:space-y-6">
            {localAssessment.sections.map((section, sectionIndex) => (
              <Card key={section.id}>
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="text-base sm:text-lg font-semibold border-none p-0 h-auto"
                        placeholder="Section title"
                      />
                      <Textarea
                        value={section.description}
                        onChange={(e) => updateSection(section.id, { description: e.target.value })}
                        placeholder="Section description"
                        className="border-none p-0 h-auto resize-none text-sm sm:text-base"
                        rows={1}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="text-destructive hover:text-destructive self-start sm:self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="p-3 sm:p-4 border rounded-lg">
                        {/* Question header */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={question.title}
                              onChange={(e) => updateQuestion(section.id, question.id, { title: e.target.value })}
                              placeholder="Question title"
                              className="font-medium border-none p-0 h-auto text-sm sm:text-base"
                            />
                            <Textarea
                              value={question.description}
                              onChange={(e) => updateQuestion(section.id, question.id, { description: e.target.value })}
                              placeholder="Question description (optional)"
                              className="border-none p-0 h-auto resize-none text-xs sm:text-sm text-muted-foreground"
                              rows={1}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(section.id, question.id)}
                            className="text-destructive hover:text-destructive self-start sm:self-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Question settings */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                          <div className="flex-1">
                            <Label className="text-sm">Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => {
                                // Reset options when changing question type
                                const updates: Partial<Question> = { type: value as any };
                                if (value === "single_choice" || value === "multi_choice") {
                                  updates.options = ["Option 1", "Option 2", "Option 3", "Option 4"];
                                  updates.correctAnswer = value === "single_choice" ? "Option 1" : ["Option 1"];
                                } else {
                                  updates.options = [];
                                  updates.correctAnswer = undefined;
                                }
                                updateQuestion(section.id, question.id, updates);
                              }}
                            >
                              <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short_text">Short Text</SelectItem>
                                <SelectItem value="long_text">Long Text</SelectItem>
                                <SelectItem value="single_choice">Single Choice</SelectItem>
                                <SelectItem value="multi_choice">Multiple Choice</SelectItem>
                                <SelectItem value="numeric_range">Numeric Range</SelectItem>
                                <SelectItem value="file_upload">File Upload</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 pt-6 sm:pt-5">
                            <input
                              type="checkbox"
                              id={`required-${question.id}`}
                              checked={question.required}
                              onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
                            />
                            <Label htmlFor={`required-${question.id}`} className="text-xs sm:text-sm">
                              Required
                            </Label>
                          </div>
                        </div>
                        
                        {/* Options for choice questions */}
                        {(question.type === "single_choice" || question.type === "multi_choice") && (
                          <div className="space-y-3 mt-4">
                            <Label className="text-xs sm:text-sm font-medium">Answer Options</Label>
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="flex-1">
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(question.options || [])];
                                        newOptions[optionIndex] = e.target.value;
                                        updateQuestion(section.id, question.id, { options: newOptions });
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="text-xs sm:text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 px-2 sm:px-0">
                                    {question.type === "single_choice" ? (
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correctAnswer === option}
                                        onChange={() => updateQuestion(section.id, question.id, { correctAnswer: option })}
                                        className="w-4 h-4"
                                      />
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)}
                                        onChange={(e) => {
                                          const currentAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                                          const newAnswers = e.target.checked
                                            ? [...currentAnswers, option]
                                            : currentAnswers.filter(a => a !== option);
                                          updateQuestion(section.id, question.id, { correctAnswer: newAnswers });
                                        }}
                                        className="w-4 h-4"
                                      />
                                    )}
                                    <Label className="text-xs text-muted-foreground">
                                      {question.type === "single_choice" ? "Correct" : "Correct"}
                                    </Label>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {question.type === "single_choice" 
                                ? "Select the radio button next to the correct answer"
                                : "Check all correct answers (multiple selections allowed)"
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addQuestion(section.id)}
                      className="w-full text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={addSection}
              className="w-full text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <div className="space-y-4">
            <div className="text-center py-3 sm:py-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                This is how candidates will see your assessment
              </p>
            </div>
            <AssessmentPreview assessment={localAssessment} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentBuilderPage;
