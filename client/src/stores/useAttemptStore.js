import { create } from "zustand";
import {
  finishTestAttempt,
  saveAttemptAnswer,
  startTestAttempt,
} from "../services/attemp.service";

export const useAttemptStore = create((set, get) => ({
  attemptId: null,
  questions: [],
  totalQuestions: 0,
  answeredCount: 0,
  remainingTime: null,
  testResult: null,
  currentQuestionCancelled: false,
  loading: false,
  error: null,
  timerIntervalId: null,

  triggerCurrentQuestionCancellation: () => {
    if (!get().currentQuestionCancelled) {
      set({ currentQuestionCancelled: true });
    }
  },

  initializeAttempt: async (testId) => {
    set({ loading: true, error: null, testResult: null });

    try {
      const response = await startTestAttempt(testId);

      const attemptData = response.data;

      set({
        attemptId: attemptData.attempt_id,
        questions: attemptData.questions || [],
        totalQuestions: attemptData.total_questions || 0,
        answeredCount: attemptData.answered_count || 0,
        remainingTime:
          attemptData.remaining_time_seconds ??
          attemptData.time_limit_seconds ??
          null,
        currentQuestionCancelled: false,
      });

      get().startTimer();
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || "Не вдалося розпочати тест.";
      set({ error: serverMessage });
    } finally {
      set({ loading: false });
    }
  },

  submitCurrentAnswer: async (answerData) => {
    const { attemptId, questions, answeredCount, currentQuestionCancelled } =
      get();

    if (!questions.length) {
      return;
    }

    const currentQuestion = questions[0];
    const payload = {
      questionId: currentQuestion.id,
      selectedAnswerIds: answerData.selectedAnswerIds || null,
      textAnswer: answerData.textAnswer || null,
      wasCancelled: currentQuestionCancelled,
    };

    set({ loading: true, error: null });

    try {
      await saveAttemptAnswer(attemptId, payload);

      const updatedQuestions = questions.slice(1);

      set({
        questions: updatedQuestions,
        answeredCount: answeredCount + 1,
        currentQuestionCancelled: false,
      });

      if (updatedQuestions.length === 0) {
        await get().finalizeAttempt();
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || "Помилка збереження відповіді.";
      set({ error: serverMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  finalizeAttempt: async () => {
    const { attemptId } = get();

    if (!attemptId) {
      return;
    }

    get().stopTimer();
    set({ loading: true, error: null });

    try {
      const resultData = await finishTestAttempt(attemptId);

      set({
        testResult: resultData,
        attemptId: null,
        questions: [],
        remainingTime: null,
      });
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || "Помилка при завершенні тесту.";
      set({ error: serverMessage });
    } finally {
      set({ loading: false });
    }
  },

  startTimer: () => {
    get().stopTimer();
    if (get().remainingTime === null) {
      return;
    }

    const interval = setInterval(() => {
      const { remainingTime } = get();

      if (remainingTime <= 1) {
        get().stopTimer();
        set({ remainingTime: 0 });
        get().finalizeAttempt();
      } else {
        set({ remainingTime: remainingTime - 1 });
      }
    }, 1000);

    set({ timerIntervalId: interval });
  },

  stopTimer: () => {
    const { timerIntervalId } = get();
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      set({ timerIntervalId: null });
    }
  },

  resetStore: () => {
    get().stopTimer();
    set({
      attemptId: null,
      questions: [],
      totalQuestions: 0,
      answeredCount: 0,
      remainingTime: null,
      currentQuestionCancelled: false,
      testResult: null,
      error: null,
      loading: false,
    });
  },
}));
