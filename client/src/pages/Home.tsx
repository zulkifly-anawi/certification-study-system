import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Target, TrendingUp, History, Award, Settings } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch question count and topics
  const { data: stats } = trpc.progress.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription>
              Your interactive learning companion for CAPM certification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ 25+ practice questions with detailed explanations</p>
              <p>✓ Track your progress across all topics</p>
              <p>✓ Identify and strengthen weak areas</p>
              <p>✓ Simulate the actual exam experience</p>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In to Start Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studyModes = [
    {
      icon: Brain,
      title: "Practice Questions",
      description: "Choose 5, 10, 20, or custom number of questions for quick practice sessions",
      color: "bg-blue-500",
      action: () => setLocation("/practice?mode=practice"),
    },
    {
      icon: Target,
      title: "Quiz Mode",
      description: "Take a 20-question quiz to build test-taking skills and confidence",
      color: "bg-green-500",
      action: () => setLocation("/practice?mode=quiz"),
    },
    {
      icon: Award,
      title: "Full Practice Exam",
      description: "Simulate the actual CAPM exam with 150 questions in 3 hours",
      color: "bg-purple-500",
      action: () => setLocation("/practice?mode=exam"),
    },
    {
      icon: BookOpen,
      title: "Study by Topic",
      description: "Focus your practice on specific topics like Scope Management or Risk",
      color: "bg-orange-500",
      action: () => setLocation("/practice?mode=topic"),
    },
    {
      icon: TrendingUp,
      title: "Progress Dashboard",
      description: "View your statistics, accuracy by topic, and overall performance",
      color: "bg-indigo-500",
      action: () => setLocation("/progress"),
    },
    {
      icon: History,
      title: "Session History",
      description: "Review past practice sessions and track your improvement over time",
      color: "bg-pink-500",
      action: () => setLocation("/history"),
    },
  ];

  const questionCount = stats?.totalQuestions || 0;
  const topicCount = stats?.topicProgress?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">CAPM Certification Prep</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin/import')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Choose Your Study Mode
            </h2>
            <p className="text-muted-foreground">
              Select a practice mode below to begin your CAPM certification journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyModes.map((mode, index) => (
              <Card 
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={mode.action}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <mode.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{mode.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your progress at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{questionCount}</div>
                  <div className="text-sm text-muted-foreground">Questions Available</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{topicCount}</div>
                  <div className="text-sm text-muted-foreground">Topics Covered</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Ready</div>
                  <div className="text-sm text-muted-foreground">Start Practicing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
