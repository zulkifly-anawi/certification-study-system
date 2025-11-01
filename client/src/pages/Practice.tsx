import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function Practice() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"practice" | "quiz" | "exam" | "topic">("practice");
  const [questionCount, setQuestionCount] = useState(10);
  const [customCount, setCustomCount] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [questions, setQuestions] = useState<any[]>([]);

  const topics = trpc.questions.getTopics.useQuery(undefined, { enabled: isAuthenticated });
  const startSession = trpc.sessions.start.useMutation();
  const submitAnswer = trpc.sessions.submitAnswer.useMutation();
  const completeSession = trpc.sessions.complete.useMutation();
  const utils = trpc.useUtils();

  // Parse URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam && ["practice", "quiz", "exam", "topic"].includes(modeParam)) {
      setMode(modeParam as any);
      if (modeParam === "quiz") setQuestionCount(20);
      if (modeParam === "exam") setQuestionCount(150);
    }
  }, []);

  const handleStart = async () => {
    try {
      let count = questionCount;
      if (mode === "practice" && customCount) {
        count = parseInt(customCount);
      }

      // Fetch questions
      let fetchedQuestions;
      if (mode === "topic" && selectedTopic) {
        fetchedQuestions = await utils.questions.getByTopic.fetch({ topic: selectedTopic, count });
      } else {
        fetchedQuestions = await utils.questions.getRandom.fetch({ count });
      }

      if (fetchedQuestions.length === 0) {
        toast.error("No questions available");
        return;
      }

      // Start session
      const session = await startSession.mutateAsync({
        sessionType: mode,
        topic: mode === "topic" ? selectedTopic : undefined,
        totalQuestions: fetchedQuestions.length,
      });

      setQuestions(fetchedQuestions);
      setSessionId(session.sessionId);
      setStartTime(Date.now());
      setStarted(true);
    } catch (error) {
      toast.error("Failed to start session");
      console.error(error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !sessionId) return;

    try {
      const result = await submitAnswer.mutateAsync({
        sessionId,
        questionId: questions[currentQuestionIndex].id,
        userAnswer: selectedAnswer,
      });

      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      toast.error("Failed to submit answer");
      console.error(error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
      setFeedback(null);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    try {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const result = await completeSession.mutateAsync({
        sessionId,
        durationSeconds,
      });

      // Invalidate progress queries to refetch updated data
      await utils.progress.getStats.invalidate();
      await utils.progress.getByTopic.invalidate();
      await utils.sessions.getHistory.invalidate();

      toast.success(`Session complete! Score: ${result.score}%`);
      setLocation("/progress");
    } catch (error) {
      toast.error("Failed to complete session");
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access practice questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container max-w-2xl mx-auto py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {mode === "practice" && "Practice Questions"}
                {mode === "quiz" && "Quiz Mode"}
                {mode === "exam" && "Full Practice Exam"}
                {mode === "topic" && "Study by Topic"}
              </CardTitle>
              <CardDescription>
                {mode === "practice" && "Choose how many questions you'd like to practice"}
                {mode === "quiz" && "20-question timed quiz to build test-taking skills"}
                {mode === "exam" && "150-question simulation of the actual CAPM exam"}
                {mode === "topic" && "Focus on a specific topic area"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mode === "practice" && (
                <div className="space-y-4">
                  <div>
                    <Label>Select Number of Questions</Label>
                    <RadioGroup value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="q5" />
                        <Label htmlFor="q5">5 questions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10" id="q10" />
                        <Label htmlFor="q10">10 questions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="20" id="q20" />
                        <Label htmlFor="q20">20 questions</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="custom">Or enter custom number</Label>
                    <Input
                      id="custom"
                      type="number"
                      min="1"
                      max="150"
                      placeholder="Enter number of questions"
                      value={customCount}
                      onChange={(e) => setCustomCount(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {mode === "topic" && (
                <div className="space-y-4">
                  <div>
                    <Label>Select Topic</Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.data?.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic-count">Number of Questions</Label>
                    <Input
                      id="topic-count"
                      type="number"
                      min="1"
                      max="50"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleStart}
                disabled={startSession.isPending || (mode === "topic" && !selectedTopic)}
              >
                {startSession.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Practice"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Topic: {currentQuestion.topic}
              </div>
              <div className="text-sm font-medium text-primary">
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </div>
            </div>
            <CardTitle className="text-xl mt-4">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display diagram/image if available */}
            {currentQuestion.mediaUrl && (
              <div className="mb-6">
                <img
                  src={currentQuestion.mediaUrl}
                  alt="Question diagram"
                  className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                />
              </div>
            )}
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback}>
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                    showFeedback && key === feedback?.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : showFeedback && key === selectedAnswer && !feedback?.isCorrect
                      ? "border-red-500 bg-red-50"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <RadioGroupItem value={key} id={key} className="mt-1" />
                  <Label htmlFor={key} className="flex-1 cursor-pointer">
                    <span className="font-medium">{key}.</span> {value as string}
                  </Label>
                  {showFeedback && key === feedback?.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {showFeedback && key === selectedAnswer && !feedback?.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>

            {showFeedback && feedback && (
              <div className={`p-4 rounded-lg ${feedback.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {feedback.isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-foreground">{feedback.explanation}</p>
              </div>
            )}

            <div className="flex gap-4">
              {!showFeedback ? (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || submitAnswer.isPending}
                >
                  {submitAnswer.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleNext}
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Session"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
