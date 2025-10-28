import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, Target, Award, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Progress() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const stats = trpc.progress.getStats.useQuery(undefined, { enabled: isAuthenticated });
  const weakTopics = trpc.progress.getWeakTopics.useQuery({ threshold: 75 }, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stats.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (stats.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Progress</CardTitle>
            <CardDescription>Failed to load your progress data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">There was an error loading your statistics. Please try again.</p>
            <div className="flex gap-2">
              <Button onClick={() => stats.refetch()}>Retry</Button>
              <Button variant="outline" onClick={() => setLocation("/")}>Go to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallStats = stats.data;
  const totalQuestions = overallStats?.totalQuestions || 0;
  const totalCorrect = overallStats?.totalCorrect || 0;
  const avgScore = overallStats?.avgScore || 0;
  const totalSessions = overallStats?.totalSessions || 0;
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your performance and identify areas for improvement</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-8 h-8 text-blue-500" />
                <div className="text-3xl font-bold">{totalSessions}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Questions Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-green-500" />
                <div className="text-3xl font-bold">{totalQuestions}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="text-3xl font-bold">{overallAccuracy}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-orange-500" />
                <div className="text-3xl font-bold">{Math.round(avgScore)}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Assessment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance Assessment</CardTitle>
            <CardDescription>Your current readiness level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{overallAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      overallAccuracy >= 85 ? "bg-green-500" :
                      overallAccuracy >= 75 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${overallAccuracy}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-foreground">
                  {overallAccuracy >= 85 && "🎉 Excellent! You're exam ready! Keep practicing to maintain your performance."}
                  {overallAccuracy >= 75 && overallAccuracy < 85 && "👍 Good progress! A bit more practice and you'll be exam ready."}
                  {overallAccuracy >= 65 && overallAccuracy < 75 && "📚 Keep going! Focus on your weak areas to improve your score."}
                  {overallAccuracy < 65 && "💪 Keep practicing! Review the explanations and focus on understanding the concepts."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progress by Topic</CardTitle>
            <CardDescription>Your accuracy across different CAPM topics</CardDescription>
          </CardHeader>
          <CardContent>
            {overallStats?.topicProgress && overallStats.topicProgress.length > 0 ? (
              <div className="space-y-4">
                {overallStats.topicProgress.map((topic: any) => (
                  <div key={topic.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{topic.topic}</span>
                      <span className="text-sm text-muted-foreground">
                        {topic.correctAttempts}/{topic.totalAttempts} ({topic.accuracy}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          topic.accuracy >= 75 ? "bg-green-500" :
                          topic.accuracy >= 50 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No topic data yet. Start practicing to see your progress!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weak Areas */}
        {weakTopics.data && weakTopics.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Areas Needing Focus
              </CardTitle>
              <CardDescription>Topics where your accuracy is below 75%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weakTopics.data.map((topic: any) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="font-medium">{topic.topic}</div>
                      <div className="text-sm text-muted-foreground">
                        {topic.correctAttempts}/{topic.totalAttempts} correct ({topic.accuracy}%)
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setLocation(`/practice?mode=topic&topic=${encodeURIComponent(topic.topic)}`)}
                    >
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
