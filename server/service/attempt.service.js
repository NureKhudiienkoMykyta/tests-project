import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export const startAttempt = async (testId, userId) => {
  // Отримати тест з питаннями, перевірити is_published
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      questions: {
        include: { answers: true },
      },
      allowed_test_domains: true,
      allowed_test_emails: true,
    },
  });

  if (!test || !test.is_published) {
    throw ApiError.notFound("Тест не знайдено");
  }

  // Перевірка доступу
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw ApiError.notFound("Користувача не знайдено");
  }

  switch (test.access_mode) {
    case "PUBLIC":
      break;
    case "DOMAIN": {
      const domain = user.email.split("@")[1];
      const domainAllowed = test.allowed_test_domains.some(
        (d) => d.domain === domain,
      );
      if (!domainAllowed) {
        throw ApiError.forbidden(
          "Цей тест має обмеження на проходження за доменом. Домен вашої пошти не міститься серед дозволених.",
        );
      }
      break;
    }
    case "EMAIL_LIST": {
      const emailAllowed = test.allowed_test_emails.some(
        (e) => e.email === user.email,
      );
      if (!emailAllowed) {
        throw ApiError.forbidden(
          "Цей тест має обмеження на проходження за поштою. Вам не надали доступ на проходження тесту.",
        );
      }
      break;
    }
  }

  // Перевірка ліміту
  // TODO: ДОДАТИ ПЕРЕВІРКУ НАЯВНОСТІ ПІДПИСКИ КОРИСТУВАЧА if (subscr) els
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: userId,
      status: { in: ["ACTIVE"] },
    },
  });

  if (!activeSubscription) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attemptsToday = await prisma.testAttempt.count({
      where: {
        user_id: userId,
        started_at: { gte: today, lt: tomorrow },
      },
    });

    if (attemptsToday >= 15) {
      throw ApiError.forbidden(
        "Денний ліміт на проходження тестів (15 спроб) закінчився. Придбайте підписку або повторіть спробу завтра.",
      );
    }
  }

  // Перевірити чи немає вже IN_PROGRESS спроби цього тесту
  const existingAttempt = await prisma.testAttempt.findFirst({
    where: {
      test_id: testId,
      user_id: userId,
      status: "IN_PROGRESS",
    },
    include: {
      attempt_answers: true,
    },
  });

  // ЯКЩО Є: Повернути питання та залишок часу
  if (existingAttempt) {
    // Якщо час вийшов, поки користувач був офлайн
    if (existingAttempt.expired_at && existingAttempt.expired_at < new Date()) {
      await prisma.testAttempt.update({
        where: { id: existingAttempt.id },
        data: { status: "EXPIRED", finished_at: new Date() },
      });
      throw ApiError.forbidden("Час на проходження цього тесту вичерпано.");
    }

    const answeredIds = existingAttempt.attempt_answers.map(
      (a) => a.question_id,
    );
    const remainingQuestions = test.questions.filter(
      (q) => !answeredIds.includes(q.id),
    );

    const questions = remainingQuestions.map((q) => ({
      id: q.id,
      type: q.type,
      content: q.content,
      points: q.points,
      answers: q.answers.map((a) => ({ id: a.id, content: a.content })),
    }));

    return {
      attempt_id: existingAttempt.id,
      questions,
      time_limit_seconds: test.time_limit_seccond,
      remaining_time_seconds: existingAttempt.expired_at
        ? Math.max(
            0,
            Math.floor(
              (existingAttempt.expired_at.getTime() - Date.now()) / 1000,
            ),
          )
        : null,
    };
  }

  //Створити TestAttempt
  const maxScore = test.questions.reduce((sum, q) => sum + q.points, 0);
  const expiredAt = test.time_limit_seccond
    ? new Date(Date.now() + test.time_limit_seccond * 1000)
    : null;

  const attempt = await prisma.testAttempt.create({
    data: {
      test_id: testId,
      user_id: userId,
      status: "IN_PROGRESS",
      max_score: maxScore,
      expired_at: expiredAt,
    },
  });

  // Повернути attempt_id + питання без правильних відповідей
  const questions = test.questions.map((q) => ({
    id: q.id,
    type: q.type,
    content: q.content,
    points: q.points,
    answers: q.answers.map((a) => ({ id: a.id, content: a.content })),
  }));

  return {
    attempt_id: attempt.id,
    questions,
    time_limit_seconds: test.time_limit_seccond,
  };
};

export const recordAnswer = async (attemptId, userId, payload) => {
  const { questionId, selectedAnswerIds, textAnswer, wasCancelled } = payload;

  // Ідентифікація та валідація спроби
  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id: attemptId,
      user_id: userId,
    },
  });

  if (!attempt) {
    throw ApiError.notFound("Спроба не знайдена");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw ApiError.forbidden("Спроба вже завершена або недійсна");
  }

  // Контроль часових обмежень
  if (attempt.expired_at && attempt.expired_at < new Date()) {
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { status: "EXPIRED", finished_at: new Date() },
    });
    throw ApiError.forbidden("Час на проходження тесту закінчився");
  }

  // Перевірка дублювання відповіді
  const existingAnswer = await prisma.attemptAnswer.findFirst({
    where: {
      attempt_id: attemptId,
      question_id: questionId,
    },
  });

  if (existingAnswer) {
    throw ApiError.conflict("Ви вже надали відповідь на це питання");
  }

  // Обробка відповіді та Snapshot
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { answers: true },
  });

  if (!question) {
    throw ApiError.notFound("Питання не знайдено");
  }

  let isCorrect = false;
  let answerSnapshot = "";

  if (wasCancelled) {
    isCorrect = false;
    answerSnapshot = "Анульовано через порушення правил (втрата фокуса вікна)";
  } else {
    // Залежно від типу питання
    switch (question.type) {
      case "SINGLE_CHOICE": {
        // Знайти обрану відповідь
        const selectedAnswer = question.answers.find(
          (a) => a.id === selectedAnswerIds?.[0],
        );
        if (selectedAnswer) {
          isCorrect = selectedAnswer.is_correct;
          answerSnapshot = selectedAnswer.content;
        } else {
          answerSnapshot = "Не обрано";
        }
        break;
      }
      case "MULTIPLE_CHOICE": {
        // Перевірити всі обрані варіанти
        const selectedAnswers = question.answers.filter((a) =>
          selectedAnswerIds?.includes(a.id),
        );
        const correctAnswers = question.answers.filter((a) => a.is_correct);

        // Правильно, якщо обрано всі правильні та тільки правильні
        isCorrect =
          selectedAnswers.length === correctAnswers.length &&
          selectedAnswers.every((a) => a.is_correct);

        answerSnapshot = selectedAnswers.map((a) => a.content).join(", ");
        break;
      }
      case "TRUE_FALSE": {
        const selectedAnswer = question.answers.find(
          (a) => a.id === selectedAnswerIds?.[0],
        );
        if (selectedAnswer) {
          isCorrect = selectedAnswer.is_correct;
          answerSnapshot = selectedAnswer.content;
        } else {
          answerSnapshot = "Не обрано";
        }
        break;
      }
      case "SHORT_TEXT":
      case "LONG_TEXT":
      case "NUMBER": {
        answerSnapshot = textAnswer || "";
        // Порівняння з correct_answer з питання
        if (question.correct_answer) {
          isCorrect =
            textAnswer?.toLowerCase().trim() ===
            question.correct_answer.toLowerCase().trim();
        } else {
          isCorrect = false;
        }
        break;
      }
    }
  }

  // Транзакційне збереження
  const result = await prisma.$transaction(async (tx) => {
    // Створити запис у AttemptAnswer
    const attemptAnswer = await tx.attemptAnswer.create({
      data: {
        attempt_id: attemptId,
        question_id: questionId,
        question_snapshot: question.content,
        answer_snapshot: answerSnapshot,
        is_correct: isCorrect,
        was_cancelled: wasCancelled,
      },
    });

    // Оновити score якщо правильна відповідь
    const updatedAttempt = await tx.testAttempt.update({
      where: { id: attemptId },
      data: isCorrect ? { score: { increment: question.points } } : {},
      select: { score: true },
    });

    return {
      attemptAnswer,
      currentScore: updatedAttempt.score,
    };
  });

  return result;
};

export const finishAttempt = async (attemptId, userId) => {
  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id: attemptId,
      user_id: userId,
    },
    include: {
      test: {
        select: {
          show_results: true,
          title: true,
        },
      },
      attempt_answers: true,
    },
  });

  if (!attempt) {
    throw ApiError.notFound("Спроба не знайдена");
  }

  if (attempt.status !== "IN_PROGRESS") {
    return formatFinishResponse(attempt);
  }

  const isExpired = attempt.expired_at && new Date() > attempt.expired_at;
  const newStatus = isExpired ? "EXPIRED" : "COMPLETED";

  const testAttemptUpdated = await prisma.testAttempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      status: newStatus,
      finished_at: new Date(),
    },
    include: {
      attempt_answers: true,
      test: true,
    },
  });

  return formatFinishResponse(testAttemptUpdated);
};

const formatFinishResponse = (attempt) => {
  const baseResponse = {
    attempt_id: attempt.id,
    test_title: attempt.test.title,
    score: attempt.score,
    max_score: attempt.max_score,
    status: attempt.status,
    finished_at: attempt.finished_at,
  };

  if (attempt.test.show_results === "ONLY_SCORE") {
    return baseResponse;
  }

  return {
    ...baseResponse,
    detailed_results: attempt.attempt_answers.map((a) => ({
      question: a.question_snapshot,
      answer: a.answer_snapshot,
      is_correct: a.is_correct,
      was_cancelled: a.was_cancelled,
    })),
  };
};

export const getResultTest = async (attemptId, userId) => {
  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id: attemptId,
      user_id: userId,
    },
    include: {
      test: {
        select: {
          show_results: true,
          title: true,
          time_limit_seccond: true,
          description: true,
          category: {
            select: {
              name: true,
            },
          },
          university: {
            select: {
              name: true,
            },
          },
          author: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      },
      attempt_answers: true,
    },
  });

  if (!attempt) {
    throw ApiError.notFound("Спроба не знайдена");
  }

  if (attempt.status === "IN_PROGRESS") {
    throw ApiError.badRequest("Результати недоступні, поки тест триває");
  }

  const baseResult = {
    attempt_id: attempt.id,
    test_title: attempt.test.title,
    description: attempt.test.description,
    score: attempt.score,
    max_score: attempt.max_score,
    status: attempt.status,
    finished_at: attempt.finished_at,
    category: attempt.test.category,
    university: attempt.test.university,
    author: attempt.test.author,
    time_limit_second: attempt.test.time_limit_seccond,
    persentage: Math.round((attempt.score / attempt.max_score) * 100) || 0,
  };

  if (attempt.test.show_results === "ONLY_SCORE") {
    return baseResult;
  }

  return {
    ...baseResult,
    detailed_results: attempt.attempt_answers.map((a) => ({
      question: a.question_snapshot,
      answer: a.answer_snapshot,
      is_correct: a.is_correct,
      was_cancelled: a.was_cancelled,
    })),
  };
};

export const getHistoryAttempts = async (userId, limit = 20, page = 1) => {
  const myAttempts = await prisma.testAttempt.findMany({
    where: {
      status: { in: ["COMPLETED", "EXPIRED"] },
      user_id: userId,
    },
    include: {
      test: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
          university: {
            select: {
              name: true,
            },
          },
          author: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
    orderBy: {
      started_at: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const total = await prisma.testAttempt.count({
    where: {
      status: { in: ["COMPLETED", "EXPIRED"] },
      user_id: userId,
    },
  });

  const formattedAttempts = myAttempts.map((attempt) => ({
    id: attempt.id,
    title: attempt.test.title,
    category: attempt.test.category,
    university: attempt.test.university,
    score: attempt.score,
    max_score: attempt.max_score,
    status: attempt.status,
    date: attempt.finished_at || attempt.started_at,
    author: attempt.test.author,
    persentage: Math.round((attempt.score / attempt.max_score) * 100) || 0,
  }));

  return {
    attempts: formattedAttempts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
