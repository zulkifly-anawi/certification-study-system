import { useAuth } from "@/_core/hooks/useAuth";
import { useCertification } from "@/contexts/CertificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Clock, Target, Award, CheckCircle2, XCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function SessionDetail() {
  const { isAuthenticated } = useAuth();
  const { selectedCertification } = useCertification();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [match, params] = useRoute("/session/:sessionId");
  const sessionId = params?.sessionId as string | undefined;

  // Fetch session details with ownership validation
  const sessionQuery = trpc.sessions.getById.useQuery(
    { sessionId: sessionId ? parseInt(sessionId) : 0 },
    { 
      enabled: isAuthenticated && !!sessionId,
      onError: (err: any) => {
        setError(err.message || "Failed to load session");
        toast.error("Unauthorized: You don't have access to this session");
      }
    }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view session details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container max-w-4xl mx-auto py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/history")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
                <p className="text-red-700 mb-6">
                  {error || "You don't have permission to view this session."}
                </p>
                <Button onClick={() => setLocation("/history")}>
                  View Your Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!sessionQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container max-w-4xl mx-auto py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/history")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  This session could not be found or has been deleted.
                </p>
                <Button onClick={() => setLocation("/history")}>
                  Back to History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const session = sessionQuery.data;
  const answers = session.answers || [];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      practice: "Practice",
      quiz: "Quiz",
      exam: "Full Exam",
      topic: "Topic Practice",
    };
    return labels[type] || type;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-yellow-600 bg-yellow-50";
    if (score >= 65) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/history")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>

        {/* Session Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {getSessionTypeLabel(session.sessionType)}
                  {session.topic && ` - ${session.topic}`}
                </CardTitle>
                <CardDescription className="mt-2">
                  {formatDate(session.startedAt)}
                </CardDescription>
              </div>
              <div className={`px-6 py-4 rounded-lg ${getScoreColor(session.score)}`}>
                <div className="text-sm font-medium mb-1">Score</div>
                <div className="text-4xl font-bold">{session.score}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Questions</div>
                <div className="text-2xl font-bold">{session.totalQuestions}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700 mb-1">Correct</div>
                <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-red-700 mb-1">Incorrect</div>
                <div className="text-2xl font-bold text-red-600">
                  {session.totalQuestions - session.correctAnswers}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">Duration</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatDuration(session.durationSeconds)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Metadata */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Started</div>
                  <div className="font-medium">{formatDate(session.startedAt)}</div>
                </div>
              </div>
              {session.completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="font-medium">{formatDate(session.completedAt)}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{formatDuration(session.durationSeconds)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Details */}
        {answers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Answer Details</CardTitle>
              <CardDescription>Review your answers for this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {answers.map((answer: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      answer.isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium mb-1">
                          Question {index + 1}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Your answer: <span className="font-semibold">{answer.userAnswer}</span>
                        </div>
                        <div className="text-sm">
                          <span className={answer.isCorrect ? "text-green-700" : "text-red-700"}>
                            {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => setLocation("/history")}
            variant="outline"
          >
            Back to History
          </Button>
          <Button
            onClick={() => setLocation("/practice")}
          >
            Start New Practice
          </Button>
        </div>
      </div>
    </div>
  );
}
