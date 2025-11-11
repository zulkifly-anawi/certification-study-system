import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { SavedSessionState, formatElapsedTime } from "@/lib/sessionStorage";

interface ResumeSessionDialogProps {
  open: boolean;
  savedSession: SavedSessionState | null;
  onResume: () => void;
  onStartNew: () => void;
}

export default function ResumeSessionDialog({
  open,
  savedSession,
  onResume,
  onStartNew,
}: ResumeSessionDialogProps) {
  if (!savedSession) return null;

  const currentElapsed = Math.floor((Date.now() - savedSession.startTime) / 1000);
  const totalElapsed = savedSession.elapsedTime + currentElapsed;
  const progress = savedSession.currentQuestionIndex + 1;
  const remaining = savedSession.totalQuestions - progress;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Resume Session?
          </DialogTitle>
          <DialogDescription>
            You have an incomplete {savedSession.mode} session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Details */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">Mode:</span>
              <span className="text-sm capitalize">{savedSession.mode}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">Progress:</span>
              <span className="text-sm">
                {progress} of {savedSession.totalQuestions} questions
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">Remaining:</span>
              <span className="text-sm">{remaining} questions</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Time Spent:
              </span>
              <span className="text-sm">{formatElapsedTime(totalElapsed)}</span>
            </div>
          </div>

          {/* Info Message */}
          <p className="text-xs text-muted-foreground">
            Your answers have been saved. You can resume where you left off or start a fresh session.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onStartNew}
            className="flex-1"
          >
            Start New
          </Button>
          <Button
            onClick={onResume}
            className="flex-1"
          >
            Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
