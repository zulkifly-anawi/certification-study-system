import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Save, Upload, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminEdit() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllQuestions = trpc.admin.getAllQuestionsForEdit.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const updateQuestion = trpc.admin.updateQuestion.useMutation();

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to server (we'll use a simple approach - store as base64 or use S3)
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        // Update the selected question with the image
        const updatedQuestion = {
          ...selectedQuestion,
          mediaUrl: dataUrl,
        };
        setSelectedQuestion(updatedQuestion);
        toast.success("Image loaded. Click Save to persist.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
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

      // Update the questions list
      setQuestions(questions.map(q => q.id === selectedQuestion.id ? selectedQuestion : q));
      toast.success("Question updated successfully");
    } catch (error) {
      toast.error("Failed to save question");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.questionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedQuestion?.id === q.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-sm font-medium truncate">{q.questionId}</div>
                      <div className="text-xs text-muted-foreground truncate">{q.topic}</div>
                      <div className="text-xs text-muted-foreground">{q.difficulty}</div>
                    </button>
                  ))}
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
                      <div className="flex items-center gap-2">
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
                          difficulty: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options Preview */}
                  <div>
                    <Label>Options</Label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(selectedQuestion.options).map(([key, value]) => (
                        <div key={key} className="p-2 bg-muted rounded text-sm">
                          <span className="font-medium">{key}.</span> {value as string}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSaveQuestion}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-8">
                  <div className="text-center text-muted-foreground">
                    <p>Select a question from the list to edit</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
