import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCertification } from "@/contexts/CertificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Upload, Download, ArrowLeft, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminImport() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCertification, setSelectedCertification } = useCertification();
  const [, setLocation] = useLocation();
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const importMutation = trpc.admin.importQuestions.useMutation();
  const exportQuery = trpc.admin.exportQuestions.useQuery({ certification: selectedCertification });
  
  // Fetch available certifications
  const { data: certifications } = trpc.certifications.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast.error("Please paste questions in JSON format");
      return;
    }

    try {
      setIsLoading(true);
      const questions = JSON.parse(jsonInput);

      if (!Array.isArray(questions)) {
        toast.error("JSON must be an array of questions");
        return;
      }

      // Validate questions structure
      for (const q of questions) {
        if (!q.text || !q.options || !q.correctAnswer || !q.topic) {
          toast.error("Each question must have: text, options (A-Z), correctAnswer, and topic");
          return;
        }
        // Validate correctAnswer is a single letter or comma-separated letters A-Z
        if (!/^[A-Z](,[A-Z])*$/.test(q.correctAnswer)) {
          toast.error(`Invalid correctAnswer '${q.correctAnswer}'. Must be a single letter A-Z or comma-separated (e.g., 'A,C' or 'A,B,D')`);
          return;
        }
      }

      await importMutation.mutateAsync({ questions, certification: selectedCertification });
      toast.success(`Successfully imported ${questions.length} questions!`);
      setJsonInput("");
      // Invalidate export query to refresh the count
      await exportQuery.refetch();
    } catch (error) {
      console.error("Full error object:", error);
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      } else if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error cause:", error.cause);
        toast.error(error.message || "Failed to import questions");
      } else {
        console.error("Unknown error type:", typeof error, error);
        toast.error("Failed to import questions");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await exportQuery.refetch();
      
      if (result.data?.questions) {
        const dataStr = JSON.stringify(result.data.questions, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `capm-questions-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${result.data.totalCount} questions successfully!`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export questions");
    } finally {
      setIsExporting(false);
    }
  };

  const exampleQuestion = {
    text: "1. Which of the following is true about the relationship of ongoing operations to projects?",
    options: {
      A: "Ongoing operations should not be viewed as part of a project.",
      B: "Ongoing operations should be included in the list of activities to be performed during project closure",
      C: "Ongoing operations should have a separate phase in the project life cycle because a large portion of life cycle costs is devoted to maintenance and operations.",
      D: "Ongoing operations should be viewed as a separate project."
    },
    correctAnswer: "D",
    explanation: "Ongoing operations are distinct from projects and should be managed separately.",
    topic: "Project Management Foundations",
    difficulty: "easy"
  };

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-9"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/admin/certifications")}
              className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-9"
            >
              <span className="hidden sm:inline">Manage Certifications</span>
              <span className="sm:hidden">Certifications</span>
            </Button>
          </div>
          
          {certifications && certifications.length > 0 && (
            <div className="flex items-center gap-2 min-w-0">
              <label className="text-xs md:text-sm font-medium whitespace-nowrap">Import for:</label>
              <Select value={selectedCertification} onValueChange={setSelectedCertification}>
                <SelectTrigger className="w-32 md:w-48 text-xs md:text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {certifications.map((cert) => (
                    <SelectItem key={cert.code} value={cert.code}>
                      {cert.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Export Card */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Export Questions
              </CardTitle>
              <CardDescription>
                Download all questions as JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-gray-600 mb-4">
                  Total: <span className="font-bold text-green-600">{exportQuery.data?.totalCount || 0}</span>
                </p>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || (exportQuery.data?.totalCount || 0) === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Question Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Add New Question
              </CardTitle>
              <CardDescription>
                Create a single question manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-gray-600 mb-4">
                  Add individual questions with multiple options
                </p>
                <Button
                  onClick={() => setLocation("/admin/add-question")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Add Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Edit Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Edit Questions
              </CardTitle>
              <CardDescription>
                Add images and edit details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-gray-600 mb-4">
                  Manage {exportQuery.data?.totalCount || 0} questions
                </p>
                <Button
                  onClick={() => setLocation("/admin/edit")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Edit Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Admin: Import Questions
            </CardTitle>
            <CardDescription>
              Bulk import practice questions from your PDF materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to Import Questions:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Prepare your questions in JSON format (see example below)</li>
                <li>Paste the JSON array into the text area</li>
                <li>Click "Import Questions"</li>
                <li>Questions will be added to the database immediately</li>
              </ol>
            </div>

            {/* Example */}
            <div>
              <h3 className="font-semibold mb-2">Example JSON Format:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify([exampleQuestion], null, 2)}
              </pre>
              <p className="text-xs text-gray-600 mt-2">
                Required fields: text, options (A-Z for standard and matching questions), correctAnswer, topic
                <br />
                Optional fields: explanation, difficulty (default: medium)
                <br />
                <span className="text-green-600 font-semibold">NEW: Now supports matching questions with options A-Z (not just A-D)!</span>
              </p>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Paste Questions JSON:</label>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON array of questions here..."
                className="min-h-64 font-mono text-sm"
              />
            </div>

            {/* Stats */}
            {jsonInput.trim() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-900">
                    {(() => {
                      try {
                        const parsed = JSON.parse(jsonInput);
                        return Array.isArray(parsed) ? `${parsed.length} questions ready to import` : "Invalid JSON";
                      } catch {
                        return "Invalid JSON format";
                      }
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleImport}
              disabled={isLoading || !jsonInput.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Importing..." : "Import Questions"}
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips for Bulk Import/Export:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• You can import multiple questions at once by providing a JSON array</p>
            <p>• Make sure all required fields are present for each question</p>
            <p>• Use consistent topic names across all questions</p>
            <p>• Difficulty levels: easy, medium, hard (defaults to medium if not specified)</p>
            <p>• Correct answer can be a single letter A-Z or multiple letters separated by commas (e.g., 'A', 'A,C', or 'A,B,D')</p>
            <p>• Options can have any number of choices (A-D for standard, A-Z for matching)</p>
            <p>• For multiple correct answers, use comma-separated format without spaces (e.g., 'A,C' not 'A, C')</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
