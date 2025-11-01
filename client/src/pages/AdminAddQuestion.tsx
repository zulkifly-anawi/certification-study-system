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
import { ArrowLeft, Plus, X, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminAddQuestion() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCertification } = useCertification();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
    explanation: "",
    topic: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    mediaUrl: "",
  });

  const createQuestion = trpc.admin.createQuestion.useMutation();
  const uploadImage = trpc.admin.uploadQuestionImage.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

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
          setFormData({ ...formData, mediaUrl: result.url });
          toast.success("Image uploaded successfully");
        } catch (error) {
          toast.error("Failed to upload image");
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

  const addOption = () => {
    const optionKeys = Object.keys(formData.options);
    const lastKey = optionKeys[optionKeys.length - 1];
    const nextKey = String.fromCharCode(lastKey.charCodeAt(0) + 1);
    
    if (nextKey.charCodeAt(0) <= 90) { // Z is 90
      setFormData({
        ...formData,
        options: { ...formData.options, [nextKey]: "" },
      });
    } else {
      toast.error("Maximum 26 options (A-Z) allowed");
    }
  };

  const removeOption = (key: string) => {
    if (Object.keys(formData.options).length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    
    const newOptions = { ...formData.options };
    delete newOptions[key];
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.text.trim()) {
      toast.error("Question text is required");
      return;
    }
    
    const filledOptions = Object.values(formData.options).filter(v => v.trim());
    if (filledOptions.length < 2) {
      toast.error("At least 2 answer options are required");
      return;
    }
    
    if (!formData.correctAnswer.trim()) {
      toast.error("Correct answer is required");
      return;
    }
    
    if (!formData.topic.trim()) {
      toast.error("Topic is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await createQuestion.mutateAsync({
        text: formData.text,
        options: formData.options,
        correctAnswer: formData.correctAnswer.toUpperCase(),
        explanation: formData.explanation,
        topic: formData.topic,
        difficulty: formData.difficulty,
        mediaUrl: formData.mediaUrl || undefined,
        certification: selectedCertification,
      });

      toast.success("Question created successfully!");
      // Reset form
      setFormData({
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        explanation: "",
        topic: "",
        difficulty: "medium",
        mediaUrl: "",
      });
    } catch (error) {
      toast.error("Failed to create question");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
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
      <div className="container max-w-3xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/admin/import")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>
              Create a new question for {selectedCertification} certification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div>
              <Label htmlFor="text">Question Text *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter the question text..."
                className="mt-2"
                rows={4}
              />
            </div>

            {/* Answer Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Answer Options *</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(formData.options).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <div className="w-12 font-semibold text-center bg-muted rounded px-2 py-2">
                      {key}
                    </div>
                    <Input
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          options: { ...formData.options, [key]: e.target.value },
                        })
                      }
                      placeholder={`Option ${key}`}
                      className="flex-1"
                    />
                    {Object.keys(formData.options).length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(key)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports A-Z options. Add or remove options as needed.
              </p>
            </div>

            {/* Correct Answer */}
            <div>
              <Label htmlFor="correctAnswer">Correct Answer(s) *</Label>
              <Input
                id="correctAnswer"
                value={formData.correctAnswer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain why this is the correct answer..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Topic */}
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Scope Management, Risk Management"
                className="mt-2"
              />
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
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

            {/* Media Upload */}
            <div>
              <Label>Diagram/Image (Optional)</Label>
              <div className="mt-2 space-y-3">
                {formData.mediaUrl && (
                  <div className="relative">
                    <img
                      src={formData.mediaUrl}
                      alt="Question diagram"
                      className="max-w-full h-auto rounded-lg border border-border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, mediaUrl: "" })}
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

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Question...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Question
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
