/**
 * Session Storage Utility
 * Manages localStorage for practice session resume functionality
 * Only enabled for Practice and Quiz modes (not Exam)
 */

export interface SavedSessionState {
  sessionId: number;
  mode: "practice" | "quiz" | "topic";
  certification: string;
  selectedTopic?: string;
  questions: any[];
  currentQuestionIndex: number;
  selectedAnswer: string;
  selectedAnswers: Set<string>;
  startTime: number;
  elapsedTime: number; // time spent before this session
  totalQuestions: number;
  savedAt: number;
}

const STORAGE_KEY = "capm_practice_session";
const RESUME_ENABLED_MODES = ["practice", "quiz"]; // Exam mode excluded

/**
 * Save current session state to localStorage
 * Only for Practice and Quiz modes
 */
export function saveSessionState(state: SavedSessionState): void {
  if (!RESUME_ENABLED_MODES.includes(state.mode)) {
    return; // Don't save for exam mode
  }

  try {
    const serializable = {
      ...state,
      selectedAnswers: Array.from(state.selectedAnswers), // Convert Set to Array for JSON
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error("Failed to save session state:", error);
  }
}

/**
 * Load saved session state from localStorage
 */
export function loadSessionState(): SavedSessionState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      selectedAnswers: new Set(parsed.selectedAnswers), // Convert Array back to Set
    };
  } catch (error) {
    console.error("Failed to load session state:", error);
    return null;
  }
}

/**
 * Check if there's a resumable session
 */
export function hasResumableSession(): boolean {
  const state = loadSessionState();
  if (!state) return false;

  // Don't resume if session is older than 24 hours
  const ageMs = Date.now() - state.savedAt;
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
  return ageMs < maxAgeMs;
}

/**
 * Clear saved session state
 */
export function clearSessionState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear session state:", error);
  }
}

/**
 * Get formatted elapsed time for display
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
