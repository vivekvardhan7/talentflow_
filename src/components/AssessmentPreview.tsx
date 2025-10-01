import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Assessment, Question } from "@/lib/database";
import { Clock, FileText, CheckCircle2 } from "lucide-react";

interface AssessmentPreviewProps {
  assessment: Assessment;
  className?: string;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({ assessment, className }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const totalQuestions = assessment.sections.reduce((total, section) => total + section.questions.length, 0);
  const answeredQuestions = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const renderQuestion = (question: Question) => {
    const isRequired = question.required;
    const hasAnswer = responses[question.id] !== undefined;

    switch (question.type) {
      case "short_text":
        return (
          <div className="space-y-2">
            <Input
              placeholder="Type your answer here..."
              value={responses[question.id] || ""}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              className="w-full"
            />
          </div>
        );

      case "long_text":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your detailed answer here..."
              value={responses[question.id] || ""}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
        );

      case "single_choice":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={responses[question.id] || ""}
              onValueChange={(value) => handleResponse(question.id, value)}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "multi_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const selectedOptions = responses[question.id] || [];
              const isSelected = selectedOptions.includes(option);
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const currentSelected = responses[question.id] || [];
                      const newSelected = checked
                        ? [...currentSelected, option]
                        : currentSelected.filter((item: string) => item !== option);
                      handleResponse(question.id, newSelected);
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case "numeric_range":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter a number..."
              value={responses[question.id] || ""}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              className="w-full"
            />
          </div>
        );

      case "file_upload":
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">Unsupported question type</div>;
    }
  };

  const currentSection = assessment.sections[currentSectionIndex];

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">{assessment.title}</CardTitle>
              {assessment.description && (
                <CardDescription className="mt-2 text-sm sm:text-base">
                  {assessment.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Est. 15 min</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{totalQuestions} questions</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Progress</span>
              <span>{answeredQuestions} of {totalQuestions} completed</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Section Navigation */}
      {assessment.sections.length > 1 && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex gap-2 flex-wrap">
              {assessment.sections.map((section, index) => (
                <Button
                  key={section.id}
                  variant={index === currentSectionIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSectionIndex(index)}
                  className="relative text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Section {index + 1}</span>
                  <span className="sm:hidden">{index + 1}</span>
                  {section.questions.some(q => responses[q.id] !== undefined) && (
                    <CheckCircle2 className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Section */}
      {currentSection && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">{currentSection.title}</CardTitle>
                {currentSection.description && (
                  <CardDescription className="mt-1 text-sm sm:text-base">
                    {currentSection.description}
                  </CardDescription>
                )}
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm self-start sm:self-center">
                Section {currentSectionIndex + 1} of {assessment.sections.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8">
            {currentSection.questions.map((question, questionIndex) => {
              const isRequired = question.required;
              const hasAnswer = responses[question.id] !== undefined;

              return (
                <div key={question.id} className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b last:border-b-0">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <Label className="text-sm sm:text-base font-medium">
                          {questionIndex + 1}. {question.title}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {question.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {question.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-start">
                        {hasAnswer && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        <Badge variant="outline" className="text-xs">
                          {question.type.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:ml-6">
                    {renderQuestion(question)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
          disabled={currentSectionIndex === 0}
          className="w-full sm:w-auto text-sm sm:text-base"
        >
          Previous Section
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentSectionIndex(Math.min(assessment.sections.length - 1, currentSectionIndex + 1))}
            disabled={currentSectionIndex === assessment.sections.length - 1}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Next Section
          </Button>
          
          {currentSectionIndex === assessment.sections.length - 1 && (
            <Button className="w-full sm:w-auto text-sm sm:text-base">
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPreview;