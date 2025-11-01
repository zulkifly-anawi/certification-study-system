import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface QuestionPreviewProps {
  question: {
    id?: number;
    text: string;
    options: Record<string, string>;
    correctAnswer: string;
    explanation: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    mediaUrl?: string | null;
  };
  onClose: () => void;
}

export default function QuestionPreview({ question, onClose }: QuestionPreviewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);

  const isMultiAnswer = question.correctAnswer.includes(',');
  const correctAnswers = question.correctAnswer.split(',');

  const handleSubmit = () => {
    if (isMultiAnswer ? selectedAnswers.size === 0 : !selectedAnswer) return;
    setShowFeedback(true);
  };

  const handleReset = () => {
    setSelectedAnswer("");
    setSelectedAnswers(new Set());
    setShowFeedback(false);
  };

  const isCorrect = isMultiAnswer
    ? Array.from(selectedAnswers).sort().join(',') === question.correctAnswer
    : selectedAnswer === question.correctAnswer;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 rounded-none">
          <CardHeader className="border-b sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Question Preview</CardTitle>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <div>Topic: {question.topic}</div>
                  <div>Difficulty: {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}</div>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Question Text */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{question.text}</h3>
            </div>

            {/* Display diagram/image if available */}
            {question.mediaUrl && (
              <div className="mb-6">
                <img
                  src={question.mediaUrl}
                  alt="Question diagram"
                  className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                />
              </div>
            )}

            {/* Answer Options */}
            {isMultiAnswer ? (
              // Multiple answer selection with checkboxes
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Select all correct answers:</p>
                {Object.entries(question.options).map(([key, value]) => {
                  const isSelected = selectedAnswers.has(key);
                  const isCorrectAnswer = correctAnswers.includes(key);

                  return (
                    <div
                      key={key}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                        showFeedback && isCorrectAnswer
                          ? "border-green-500 bg-green-50"
                          : showFeedback && isSelected && !isCorrect
                          ? "border-red-500 bg-red-50"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <Checkbox
                        id={`preview-${key}`}
                        checked={isSelected}
                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                          if (checked === 'indeterminate') return;
                          const newAnswers = new Set(selectedAnswers);
                          if (checked) {
                            newAnswers.add(key);
                          } else {
                            newAnswers.delete(key);
                          }
                          setSelectedAnswers(newAnswers);
                        }}
                        disabled={showFeedback}
                        className="mt-1"
                      />
                      <Label htmlFor={`preview-${key}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{key}.</span> {value as string}
                      </Label>
                      {showFeedback && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Single answer selection with radio buttons
              <div className="space-y-3">
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback}>
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                        showFeedback && key === question.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : showFeedback && key === selectedAnswer && !isCorrect
                          ? "border-red-500 bg-red-50"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <RadioGroupItem value={key} id={`preview-${key}`} className="mt-1" />
                      <Label htmlFor={`preview-${key}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{key}.</span> {value as string}
                      </Label>
                      {showFeedback && key === question.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                      {showFeedback && key === selectedAnswer && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-foreground">{question.explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              {!showFeedback ? (
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isMultiAnswer ? selectedAnswers.size === 0 : !selectedAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleReset}
                >
                  Try Again
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Close Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
