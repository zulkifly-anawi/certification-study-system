import { useAuth } from "@/_core/hooks/useAuth";
import { useCertification } from "@/contexts/CertificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Save, Upload, X, Loader2, Trash2, Eye } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import QuestionPreview from "@/components/QuestionPreview";

export default function AdminEdit() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCertification } = useCertification();
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Declare all hooks unconditionally
  const getAllQuestions = trpc.admin.getAllQuestionsForEdit.useQuery({ certification: selectedCertification }, { 
    enabled: isAuthenticated && user?.role === 'admin' 
  });
  const updateQuestion = trpc.admin.updateQuestion.useMutation();
  const deleteQuestion = trpc.admin.deleteQuestion.useMutation();
  const uploadImage = trpc.admin.uploadQuestionImage.useMutation();

  useEffect(() => {
    if (getAllQuestions.data?.questions) {
      setQuestions(getAllQuestions.data.questions);
    }
  }, [getAllQuestions.data]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedQuestion || !e.target.files?.[0]) return;

    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = (event.target?.result as string).split(',')[1];
          const result = await uploadImage.mutateAsync({
            fileName: file.name,
            fileData: base64Data,
          });
          const updatedQuestion = {
            ...selectedQuestion,
            mediaUrl: result.url,
          };
          setSelectedQuestion(updatedQuestion);
          toast.success("Image uploaded successfully. Click Save to persist.");
        } catch (error) {
          toast.error("Failed to upload image to storage");
          console.error(error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      setIsSaving(true);
      await updateQuestion.mutateAsync({
        id: selectedQuestion.id,
        text: selectedQuestion.text,
        options: selectedQuestion.options,
        correctAnswer: selectedQuestion.correctAnswer,
        explanation: selectedQuestion.explanation,
        topic: selectedQuestion.topic,
        difficulty: selectedQuestion.difficulty,
        mediaUrl: selectedQuestion.mediaUrl,
      });

      setQuestions(questions.map(q => q.id === selectedQuestion.id ? selectedQuestion : q));
      toast.success("Question updated successfully");
    } catch (error) {
      toast.error("Failed to save question");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      await deleteQuestion.mutateAsync({
        id: selectedQuestion.id,
        certification: selectedCertification,
      });

      setQuestions(questions.filter(q => q.id !== selectedQuestion.id));
      setSelectedQuestion(null);
      toast.success("Question deleted successfully");
    } catch (error) {
      toast.error("Failed to delete question");
      console.error(error);
    }
  };

  // State for filters
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  // Get unique topics and difficulties for filters
  const uniqueTopics = Array.from(new Set(questions.map(q => q.topic))).sort();
  const difficulties = ["easy", "medium", "hard"];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.questionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || q.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  // Conditional rendering instead of early return
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-9">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/admin/import")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  {questions.length} total questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by text, topic, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTopics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic.substring(0, 20)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTopic && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-2"
                      onClick={() => setSelectedTopic("")}
                    >
                      Clear
                    </Button>
                  )}

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDifficulty && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-2"
                      onClick={() => setSelectedDifficulty("")}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Showing {filteredQuestions.length} of {questions.length} questions
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((q) => {
                    const difficultyColors = {
                      easy: "bg-green-100 text-green-800",
                      medium: "bg-yellow-100 text-yellow-800",
                      hard: "bg-red-100 text-red-800",
                    };
                    const diffColor = difficultyColors[q.difficulty] || "bg-gray-100 text-gray-800";
                    const preview = q.text.substring(0, 80) + (q.text.length > 80 ? "..." : "");
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuestion(q)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selectedQuestion?.id === q.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-xs font-mono text-muted-foreground">{q.questionId}</div>
                          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${diffColor}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="text-sm font-medium line-clamp-2 mb-1">{preview}</div>
                        <div className="text-xs text-muted-foreground truncate">{q.topic}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedQuestion.questionId}</CardTitle>
                      <CardDescription>{selectedQuestion.topic}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <Label htmlFor="text">Question Text</Label>
                    <Textarea
                      id="text"
                      value={selectedQuestion.text}
                      onChange={(e) =>
                        setSelectedQuestion({ ...selectedQuestion, text: e.target.value })
                      }
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  {/* Answer Options */}
                  <div>
                    <Label>Answer Options</Label>
                    <div className="mt-2 space-y-3">
                      {selectedQuestion.options && Object.entries(selectedQuestion.options).map(([key, value]) => (
                        <div key={key} className="flex gap-2 items-start">
                          <div className="w-12 pt-2 font-semibold text-center bg-muted rounded px-2 py-1">
                            {key}
                          </div>
                          <Input
                            value={value}
                            onChange={(e) =>
                              setSelectedQuestion({
                                ...selectedQuestion,
                                options: {
                                  ...selectedQuestion.options,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            placeholder={`Option ${key}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <Label>Diagram/Image (Optional)</Label>
                    <div className="mt-2 space-y-3">
                      {selectedQuestion.mediaUrl && (
                        <div className="relative">
                          <img
                            src={selectedQuestion.mediaUrl}
                            alt="Question diagram"
                            className="max-w-full h-auto rounded-lg border border-border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              setSelectedQuestion({ ...selectedQuestion, mediaUrl: null })
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-9">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        {uploadingImage && <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer(s)</Label>
                    <Input
                      id="correctAnswer"
                      value={selectedQuestion.correctAnswer}
                      onChange={(e) =>
                        setSelectedQuestion({
                          ...selectedQuestion,
                          correctAnswer: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="A or A,C or A,B,D"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Single letter (A-Z) or comma-separated (A,C,E)
                    </p>
                  </div>

                  {/* Explanation */}
                  <div>
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      value={selectedQuestion.explanation}
                      onChange={(e) =>
                        setSelectedQuestion({
                          ...selectedQuestion,
                          explanation: e.target.value,
                        })
                      }
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Topic */}
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={selectedQuestion.topic}
                      onChange={(e) =>
                        setSelectedQuestion({ ...selectedQuestion, topic: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={selectedQuestion.difficulty}
                      onValueChange={(value) =>
                        setSelectedQuestion({
                          ...selectedQuestion,
                          difficulty: value as "easy" | "medium" | "hard",
                        })
                      }
                    >
                      <SelectTrigger id="difficulty" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Save and Delete Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={handleSaveQuestion}
                      disabled={isSaving}
                      className="flex-1 text-xs md:text-sm px-2 md:px-4 py-2 md:py-2 h-9 md:h-10"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin flex-shrink-0" />
                          <span className="hidden sm:inline">Saving...</span>
                          <span className="sm:hidden">Saving</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                          <span className="hidden sm:inline">Save Question</span>
                          <span className="sm:hidden">Save</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowPreview(true)}
                      variant="outline"
                      className="flex-1 sm:flex-none gap-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-9 md:h-10"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Preview</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex-1 sm:flex-none gap-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-9 md:h-10"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="space-y-3 mt-4">
                          <div className="font-semibold text-foreground">Question:</div>
                          <div className="text-sm bg-muted p-3 rounded max-h-32 overflow-y-auto">
                            {selectedQuestion.text}
                          </div>
                          <div className="text-sm text-destructive font-medium">
                            This action cannot be undone. The question will be permanently deleted.
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteQuestion}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Select a question to edit
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedQuestion && (
        <QuestionPreview
          question={{
            id: selectedQuestion.id,
            text: selectedQuestion.text,
            options: selectedQuestion.options,
            correctAnswer: selectedQuestion.correctAnswer,
            explanation: selectedQuestion.explanation,
            topic: selectedQuestion.topic,
            difficulty: selectedQuestion.difficulty,
            mediaUrl: selectedQuestion.mediaUrl,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
