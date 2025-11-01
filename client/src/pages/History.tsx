import { useAuth } from "@/_core/hooks/useAuth";
import { useCertification } from "@/contexts/CertificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Clock, Target, Award } from "lucide-react";
import { useLocation } from "wouter";

export default function History() {
  const { isAuthenticated } = useAuth();
  const { selectedCertification } = useCertification();
  const [, setLocation] = useLocation();
  
  const sessions = trpc.sessions.getHistory.useQuery({ limit: 20, certification: selectedCertification }, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your session history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessions.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your history...</p>
        </div>
      </div>
    );
  }

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
      <div className="container max-w-5xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Session History</h1>
          <p className="text-muted-foreground">Review your past practice sessions and track improvement</p>
        </div>

        {sessions.data && sessions.data.length > 0 ? (
          <div className="space-y-4">
            {sessions.data.map((session: any) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {getSessionTypeLabel(session.sessionType)}
                            {session.topic && ` - ${session.topic}`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(session.startedAt)}
                            </span>
                            {session.durationSeconds && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(session.durationSeconds)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Questions</div>
                        <div className="text-2xl font-bold">{session.totalQuestions}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Correct</div>
                        <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
                      </div>

                      <div className={`px-4 py-2 rounded-lg ${getScoreColor(session.score)}`}>
                        <div className="text-sm font-medium mb-1">Score</div>
                        <div className="text-3xl font-bold">{session.score}%</div>
                      </div>
                    </div>
                  </div>

                  {session.completedAt && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Completed: {formatDate(session.completedAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {session.score >= 85 && "Excellent"}
                            {session.score >= 75 && session.score < 85 && "Good"}
                            {session.score >= 65 && session.score < 75 && "Fair"}
                            {session.score < 65 && "Needs Improvement"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start practicing to see your session history here
                </p>
                <Button onClick={() => setLocation("/practice")}>
                  Start Your First Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
