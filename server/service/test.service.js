import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const TEST_ACCESS_TYPES = ["PUBLIC", "DOMAIN", "EMAIL_LIST"];
const SHOW_RESULTS_TYPES = ["FULL", "ONLY_SCORE"];
const QUESTION_TYPES = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_TEXT",
  "LONG_TEXT",
  "NUMBER",
];

const normalizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.trim();
};

const buildAnswerCreate = (answer, questionIndex, answerIndex) => {
  const content = normalizeString(answer.content);
  if (!content) {
    throw ApiError.unprocessableEntity(
      `Питання ${questionIndex + 1}, відповідь ${answerIndex + 1}: поле content має бути непорожнім`,
    );
  }

  const isCorrect = answer.is_correct;
  if (typeof isCorrect !== "boolean") {
    throw ApiError.unprocessableEntity(
      `Питання ${questionIndex + 1}, відповідь ${answerIndex + 1}: поле is_correct має бути boolean`,
    );
  }

  return {
    content,
    is_correct: isCorrect,
  };
};

const buildQuestionCreate = (question, index) => {
  const rawType = question.type;
  const type =
    typeof rawType === "string" ? rawType.trim().toUpperCase() : rawType;

  if (!QUESTION_TYPES.includes(type)) {
    throw ApiError.unprocessableEntity(
      `Питання ${index + 1}: невірний тип питання`,
    );
  }

  const content = normalizeString(question.content);
  if (!content) {
    throw ApiError.unprocessableEntity(
      `Питання ${index + 1}: поле content має бути непорожнім`,
    );
  }

  const pointsRaw = question.points;
  const points = Number(pointsRaw);
  if (!Number.isInteger(points) || points < 0) {
    throw ApiError.unprocessableEntity(
      `Питання ${index + 1}: поле points має бути цілим числом`,
    );
  }

  if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(type)) {
    const rawCorrectAnswer = question.correct_answer;
    if (
      rawCorrectAnswer === undefined ||
      rawCorrectAnswer === null ||
      String(rawCorrectAnswer).trim() === ""
    ) {
      throw ApiError.unprocessableEntity(
        `Питання ${index + 1}: поле correct_answer обов'язкове для типу ${type}`,
      );
    }

    let correctAnswer;

    if (type === "NUMBER") {
      const numberValue =
        typeof rawCorrectAnswer === "number"
          ? rawCorrectAnswer
          : Number(String(rawCorrectAnswer).trim());

      if (Number.isNaN(numberValue)) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: correctAnswer має бути дійсним числом для типу NUMBER`,
        );
      }

      correctAnswer = String(numberValue);
    } else {
      correctAnswer = String(rawCorrectAnswer).trim();
    }

    return {
      type,
      content,
      points,
      correct_answer: correctAnswer,
    };
  }

  const answers = question.answers;
  if (!Array.isArray(answers) || answers.length === 0) {
    throw ApiError.unprocessableEntity(
      `Питання ${index + 1}: поле answers повинно бути масивом з відповідями`,
    );
  }

  if (type === "TRUE_FALSE" && answers.length !== 2) {
    throw ApiError.unprocessableEntity(
      `Питання ${index + 1}: для TRUE_FALSE повинно бути рівно 2 відповіді`,
    );
  }

  const answerCreates = answers.map((answer, answerIndex) =>
    buildAnswerCreate(answer, index, answerIndex),
  );

  const correctCount = answerCreates.filter(
    (answer) => answer.is_correct,
  ).length;

  if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
    if (correctCount !== 1) {
      throw ApiError.unprocessableEntity(
        `Питання ${index + 1}: для ${type} має бути рівно одна правильна відповідь`,
      );
    }
  }

  if (type === "MULTIPLE_CHOICE" && correctCount === 0) {
    throw ApiError.unprocessableEntity(
      `Питання ${index + 1}: для MULTIPLE_CHOICE має бути хоча б одна правильна відповідь`,
    );
  }

  return {
    type,
    content,
    points,
    answers: {
      create: answerCreates,
    },
  };
};

export const createTest = async (authorId, payload) => {
  const title = normalizeString(payload.title);
  const description = normalizeString(payload.description);
  const categoryIdRaw = payload.category_id;
  const categoryId = Number(categoryIdRaw);
  const accessModeRaw = payload.access_mode;
  const accessMode =
    typeof accessModeRaw === "string"
      ? accessModeRaw.trim().toUpperCase()
      : accessModeRaw;
  const showResultsRaw = payload.show_results;
  const showResults =
    typeof showResultsRaw === "string"
      ? showResultsRaw.trim().toUpperCase()
      : showResultsRaw;
  const timeLimitRaw = payload.time_limit_seccond;
  const timeLimitSecond =
    timeLimitRaw === undefined || timeLimitRaw === null
      ? null
      : Number(timeLimitRaw);
  const questions = payload.questions;
  const allowedDomains = payload.allowed_domains;
  const allowedEmails = payload.allowed_emails;

  if (!title || !description || categoryIdRaw == null || isNaN(categoryId)) {
    throw ApiError.badRequest("Назва, опис та категорія є обов'язковими");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw ApiError.badRequest("Потрібно передати хоча б одне питання");
  }

  if (!TEST_ACCESS_TYPES.includes(accessMode)) {
    throw ApiError.unprocessableEntity("Невірний accessMode");
  }

  if (!SHOW_RESULTS_TYPES.includes(showResults)) {
    throw ApiError.unprocessableEntity("Невірний showResults");
  }

  if (timeLimitSecond !== null && timeLimitSecond < 0) {
    throw ApiError.unprocessableEntity(
      "Обмеження в часі має бути невід'ємним цілим числом",
    );
  }

  if (accessMode === "DOMAIN") {
    if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
      throw ApiError.unprocessableEntity(
        "Для DOMAIN необхідно передати allowedDomains",
      );
    }
  }

  if (accessMode === "EMAIL_LIST") {
    if (!Array.isArray(allowedEmails) || allowedEmails.length === 0) {
      throw ApiError.unprocessableEntity(
        "Для EMAIL_LIST необхідно передати allowedEmails",
      );
    }
  }

  if (
    accessMode === "PUBLIC" &&
    Array.isArray(allowedDomains) &&
    allowedDomains.length > 0
  ) {
    throw ApiError.unprocessableEntity(
      "Для PUBLIC не потрібно передавати allowedDomains",
    );
  }

  if (
    accessMode === "PUBLIC" &&
    Array.isArray(allowedEmails) &&
    allowedEmails.length > 0
  ) {
    throw ApiError.unprocessableEntity(
      "Для PUBLIC не потрібно передавати allowedEmails",
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw ApiError.notFound("Категорія не знайдена");
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { university_id: true },
  });

  if (!author) {
    throw ApiError.unauthorized();
  }

  const universityId = author.university_id;

  const questionCreates = questions.map(buildQuestionCreate);

  const testData = {
    title,
    description,
    category_id: categoryId,
    author_id: authorId,
    university_id: universityId,
    access_mode: accessMode,
    show_results: showResults,
    time_limit_seccond: timeLimitSecond,
    is_published: true, // НЕ ЗАБУТЬ, ЯКЩО ЗАХОЧ. МОДЕРАЦІЮ АБО ЧОРНЕТКУ - false
    questions: {
      create: questionCreates,
    },
  };

  if (accessMode === "DOMAIN") {
    testData.allowed_test_domains = {
      create: allowedDomains.map((domain, index) => {
        const domainValue = normalizeString(domain);
        if (!domainValue) {
          throw ApiError.unprocessableEntity(
            `allowedDomains[${index}] має бути непорожнім рядком`,
          );
        }
        return { domain: domainValue };
      }),
    };
  }

  if (accessMode === "EMAIL_LIST") {
    testData.allowed_test_emails = {
      create: allowedEmails.map((email, index) => {
        const emailValue = normalizeString(email);
        if (!emailValue) {
          throw ApiError.unprocessableEntity(
            `allowedEmails[${index}] має бути непорожнім рядком`,
          );
        }
        return { email: emailValue };
      }),
    };
  }

  const createdTest = await prisma.test.create({
    data: testData,
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
      allowed_test_domains: true,
      allowed_test_emails: true,
    },
  });

  return createdTest;
};

export const deleteTest = async (authorId, testId) => {
  const testIdNumber = Number(testId);

  if (isNaN(testIdNumber)) {
    throw ApiError.badRequest("Неправильний формат ідентифікатора тесту");
  }

  const test = await prisma.test.findFirst({
    where: {
      id: testIdNumber,
      author_id: authorId,
    },
  });

  if (!test) {
    throw ApiError.notFound(
      "Тест не знайдено або у вас немає прав на його видалення",
    );
  }

  const deletedTest = await prisma.test.delete({
    where: {
      id: testIdNumber,
    },
  });

  return deletedTest;
};

export const getTestInformationById = async (testId) => {
  const testData = await prisma.test.findUnique({
    where: {
      id: testId,
    },
    include: {
      category: true,
      university: true,
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      allowed_test_domains: {
        select: {
          domain: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  if (!testData) {
    throw ApiError.notFound("Тесту не існує");
  }

  return {
    id: testData.id,
    title: testData.title,
    description: testData.description,
    accessMode: testData.access_mode,
    allowedDomains: testData.allowed_test_domains,
    showResults: testData.show_results,
    timeLimitSecond: testData.time_limit_seccond,
    createdAt: testData.created_at,
    questionsCount: testData._count.questions,
    author: testData.author,
    category: testData.category,
    university: testData.university,
  };
};

const formatTestResponse = (test) => {
  return {
    id: test.id,
    title: test.title,
    description: test.description,
    timeLimitSeconds: test.time_limit_seccond,
    accessMode: test.access_mode,
    createdAt: test.created_at,
    category: test.category?.name || test.category || null,
    university: test.university?.name || null,
    author: test.author,
    questionsCount: test._count?.questions || 0,
    completedAttemptsCount: test._count?.test_attempts || 0,
  };
};

export const getTests = async (
  page = 1,
  limit = 20,

  search,
  categoryId,
  universityId,

  sortBy = "newest",
) => {
  const where = {
    is_published: true,
  };

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (universityId) {
    where.university_id = universityId;
  }

  let orderBy = {
    created_at: "desc",
  };

  if (sortBy === "oldest") {
    orderBy = {
      created_at: "asc",
    };
  }

  const tests = await prisma.test.findMany({
    where,

    include: {
      category: true,
      university: true,

      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },

      _count: {
        select: {
          questions: true,
        },
      },
    },

    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.test.count({
    where,
  });

  return {
    tests: tests.map(formatTestResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyTests = async (userId, page = 1, limit = 20) => {
  const myTests = await prisma.test.findMany({
    where: {
      author_id: userId,
    },
    include: {
      category: true,
      university: true,
      author: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      _count: {
        select: { questions: true },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.test.count({
    where: {
      author_id: userId,
    },
  });

  return {
    tests: myTests.map(formatTestResponse),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getContinueTests = async (userId) => {
  const attempts = await prisma.testAttempt.findMany({
    where: {
      user_id: userId,
      status: "IN_PROGRESS",
    },
    include: {
      test: {
        select: {
          title: true,
          _count: {
            select: {
              questions: true,
            },
          },
        },
      },
      _count: {
        select: {
          attempt_answers: true,
        },
      },
    },
  });

  return attempts.map((attempt) => ({
    attemptId: attempt.id,
    testId: attempt.test_id,
    title: attempt.test?.title || null,
    totalQuestions: attempt.test?._count.questions || 0,
    answeredQuestions: attempt._count.attempt_answers || 0,
  }));
};

export const getPopularTests = async (limit = 20) => {
  const tests = await prisma.test.findMany({
    where: { is_published: true },
    include: {
      category: true,
      university: true,
      author: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      _count: {
        select: {
          questions: true,
          test_attempts: {
            where: { status: { in: ["COMPLETED", "EXPIRED"] } },
          },
        },
      },
    },
    orderBy: {
      test_attempts: { _count: "desc" },
    },
    take: limit,
  });

  return tests.map(formatTestResponse);
};

export const getTestForEdit = async (userId, testId) => {
  const testIdNumber = Number(testId);

  if (isNaN(testIdNumber)) {
    throw ApiError.badRequest("Неправильний формат ідентифікатора тесту");
  }

  const test = await prisma.test.findFirst({
    where: {
      id: testIdNumber,
      author_id: userId,
    },
    include: {
      category: true,
      university: true,
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      questions: {
        include: {
          answers: true,
        },
      },
      allowed_test_domains: true,
      allowed_test_emails: true,
    },
  });

  if (!test) {
    throw ApiError.notFound(
      "Тест не знайдено або у вас немає прав на його редагування",
    );
  }

  return test;
};

const validateUpdatePayload = (payload) => {
  const title = normalizeString(payload.title);
  if (!title || title.length < 3) {
    throw ApiError.badRequest(
      "Назва обов'язкова і має містити принаймні 3 символи",
    );
  }

  const description = normalizeString(payload.description);
  if (!description) {
    throw ApiError.badRequest("Опис обов'язковий");
  }

  const categoryIdRaw = payload.category_id;
  const categoryId = Number(categoryIdRaw);
  if (
    !categoryIdRaw ||
    isNaN(categoryId) ||
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw ApiError.badRequest(
      "category_id обов'язковий і має бути позитивним цілим числом",
    );
  }

  const accessMode = payload.access_mode;
  if (!TEST_ACCESS_TYPES.includes(accessMode)) {
    throw ApiError.unprocessableEntity("Невірний access_mode");
  }

  const showResults = payload.show_results;
  if (!SHOW_RESULTS_TYPES.includes(showResults)) {
    throw ApiError.unprocessableEntity("Невірний show_results");
  }

  const timeLimitRaw = payload.time_limit_seccond;
  const timeLimitSecond =
    timeLimitRaw === undefined || timeLimitRaw === null
      ? null
      : Number(timeLimitRaw);
  if (
    timeLimitSecond !== null &&
    (timeLimitSecond < 0 || !Number.isInteger(timeLimitSecond))
  ) {
    throw ApiError.unprocessableEntity(
      "time_limit_seccond має бути невід'ємним цілим числом або null",
    );
  }

  const questions = payload.questions;
  if (!Array.isArray(questions)) {
    throw ApiError.badRequest("questions має бути масивом");
  }

  const allowedDomains = payload.allowed_domains;
  const allowedEmails = payload.allowed_emails;

  if (accessMode === "DOMAIN") {
    if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
      throw ApiError.unprocessableEntity(
        "Для DOMAIN необхідно передати allowed_domains",
      );
    }
  }

  if (accessMode === "EMAIL_LIST") {
    if (!Array.isArray(allowedEmails) || allowedEmails.length === 0) {
      throw ApiError.unprocessableEntity(
        "Для EMAIL_LIST необхідно передати allowed_emails",
      );
    }
  }

  if (accessMode === "PUBLIC") {
    if (Array.isArray(allowedDomains) && allowedDomains.length > 0) {
      throw ApiError.unprocessableEntity(
        "Для PUBLIC не потрібно передавати allowed_domains",
      );
    }
    if (Array.isArray(allowedEmails) && allowedEmails.length > 0) {
      throw ApiError.unprocessableEntity(
        "Для PUBLIC не потрібно передавати allowed_emails",
      );
    }
  }

  // ВАЛІДАЦІЯ ПИТАНЬ
  questions.forEach((question, index) => {
    const type = question.type;
    if (!QUESTION_TYPES.includes(type)) {
      throw ApiError.unprocessableEntity(
        `Питання ${index + 1}: невірний тип питання`,
      );
    }

    const content = normalizeString(question.content);
    if (!content) {
      throw ApiError.unprocessableEntity(
        `Питання ${index + 1}: поле content має бути непорожнім`,
      );
    }

    const pointsRaw = question.points;
    const points = Number(pointsRaw);
    if (!Number.isInteger(points) || points <= 0) {
      throw ApiError.unprocessableEntity(
        `Питання ${index + 1}: поле points має бути позитивним цілим числом`,
      );
    }

    if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(type)) {
      const rawCorrectAnswer = question.correct_answer;
      if (
        rawCorrectAnswer === undefined ||
        rawCorrectAnswer === null ||
        String(rawCorrectAnswer).trim() === ""
      ) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: поле correct_answer обов'язкове для типу ${type}`,
        );
      }
      if (type === "NUMBER") {
        const numberValue =
          typeof rawCorrectAnswer === "number"
            ? rawCorrectAnswer
            : Number(String(rawCorrectAnswer).trim());
        if (Number.isNaN(numberValue)) {
          throw ApiError.unprocessableEntity(
            `Питання ${index + 1}: correct_answer має бути дійсним числом для типу NUMBER`,
          );
        }
      }
    } else {
      const answers = question.answers;
      if (!Array.isArray(answers)) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: поле answers повинно бути масивом`,
        );
      }

      if (type === "TRUE_FALSE" && answers.length !== 2) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: для TRUE_FALSE повинно бути рівно 2 відповіді`,
        );
      }

      if (
        (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") &&
        answers.length < 2
      ) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: для ${type} має бути принаймні 2 відповіді`,
        );
      }

      const correctCount = answers.filter(
        (answer) => answer.is_correct === true,
      ).length;
      if (type === "SINGLE_CHOICE" && correctCount !== 1) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: для SINGLE_CHOICE має бути рівно одна правильна відповідь`,
        );
      }
      if (type === "MULTIPLE_CHOICE" && correctCount === 0) {
        throw ApiError.unprocessableEntity(
          `Питання ${index + 1}: для MULTIPLE_CHOICE має бути хоча б одна правильна відповідь`,
        );
      }

      answers.forEach((answer, answerIndex) => {
        const content = normalizeString(answer.content);
        if (!content) {
          throw ApiError.unprocessableEntity(
            `Питання ${index + 1}, відповідь ${answerIndex + 1}: поле content має бути непорожнім`,
          );
        }
        if (typeof answer.is_correct !== "boolean") {
          throw ApiError.unprocessableEntity(
            `Питання ${index + 1}, відповідь ${answerIndex + 1}: поле is_correct має бути boolean`,
          );
        }
      });
    }
  });

  return {
    title,
    description,
    categoryId,
    accessMode,
    showResults,
    timeLimitSecond,
    questions,
    allowedDomains: allowedDomains || [],
    allowedEmails: allowedEmails || [],
  };
};

export const updateTest = async (userId, testId, payload) => {
  const testIdNumber = Number(testId);
  if (isNaN(testIdNumber)) {
    throw ApiError.badRequest("Неправильний формат ідентифікатора тесту");
  }

  const validated = validateUpdatePayload(payload);

  const result = await prisma.$transaction(async (tx) => {
    const existingTest = await tx.test.findFirst({
      where: {
        id: testIdNumber,
        author_id: userId,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
        allowed_test_domains: true,
        allowed_test_emails: true,
      },
    });

    if (!existingTest) {
      throw ApiError.notFound(
        "Тест не знайдено або у вас немає прав на його редагування",
      );
    }

    // ПЕРЕВІРКА НА ІСНУВАННЯ КАТЕГОРІЇ В БД))
    const category = await tx.category.findUnique({
      where: { id: validated.categoryId },
    });
    if (!category) {
      throw ApiError.notFound("Категорія не знайдена");
    }

    // ОНОВЛЕННЯ ТЕСТУ(САМЕ ТЕСТУ, БЕЗ ПИТАНЬ)
    await tx.test.update({
      where: { id: testIdNumber },
      data: {
        title: validated.title,
        description: validated.description,
        category_id: validated.categoryId,
        access_mode: validated.accessMode,
        show_results: validated.showResults,
        time_limit_seccond: validated.timeLimitSecond,
      },
    });

    // ОТРИМУЄМО ID ПИТАНЬ В БД ТА ЯКІ ПРИЙШЛИ ДО НАС НА РЕДАГУВАННЯ
    const existingQuestionIds = existingTest.questions.map((q) => q.id);
    const payloadQuestionIds = validated.questions
      .filter((q) => q.id !== null && q.id !== undefined)
      .map((q) => Number(q.id));

    // ВИДАЛЯЄМО ТІ ПИТАННЯ, ID ЯКИХ МИ НЕ ПЕРЕДАЛИ З КЛІЄНТА
    const questionsToDelete = existingQuestionIds.filter(
      (id) => !payloadQuestionIds.includes(id),
    );
    if (questionsToDelete.length > 0) {
      await tx.question.deleteMany({
        where: {
          id: { in: questionsToDelete },
          test_id: testIdNumber,
        },
      });
    }

    // СТВОРЮЄМО АБО ОНОВЛЮЄМО ТІ ПИТАННЯ ЯКІ БЕЗ ID АБО З ID, АЛЕ ІСНУЮТЬ В БД
    for (const question of validated.questions) {
      if (question.id !== null && question.id !== undefined) {
        // ОНОВЛЮЄМО ПИТАННЯ, ЯКІ ВЖЕ Є
        const questionId = Number(question.id);
        const type = question.type;
        const content = normalizeString(question.content);
        const points = Number(question.points);

        let updateData = {
          type,
          content,
          points,
        };

        if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(type)) {
          let correctAnswer;
          if (type === "NUMBER") {
            correctAnswer = String(Number(question.correct_answer));
          } else {
            correctAnswer = String(question.correct_answer).trim();
          }
          updateData.correct_answer = correctAnswer;
        } else {
          updateData.correct_answer = null;
        }

        await tx.question.update({
          where: { id: questionId },
          data: updateData,
        });

        // ОТРИМАННЯ ВІДПОВІДЕЙ ДЛЯ ПИТАНЬ
        const existingAnswerIds = existingTest.questions
          .find((q) => q.id === questionId)
          .answers.map((a) => a.id);
        const payloadAnswerIds = question.answers
          .filter((a) => a.id !== null && a.id !== undefined)
          .map((a) => Number(a.id));

        // ВИДАЛЕННЯ ВІДПОВІДЕЙ, ЯКІ МИ НЕ ПЕРЕДАЛИ З КЛІЄНТУ
        const answersToDelete = existingAnswerIds.filter(
          (id) => !payloadAnswerIds.includes(id),
        );
        if (answersToDelete.length > 0) {
          await tx.answer.deleteMany({
            where: {
              id: { in: answersToDelete },
              question_id: questionId,
            },
          });
        }

        // ОНОВЛЕННЯ АБО СТВОРЕННЯ ВІДПОВІДІ
        for (const answer of question.answers) {
          const content = normalizeString(answer.content);
          const isCorrect = answer.is_correct;

          if (answer.id !== null && answer.id !== undefined) {
            // ОНОВЛЕННЯ ВІДПОВІДІ
            await tx.answer.update({
              where: { id: Number(answer.id) },
              data: { content, is_correct: isCorrect },
            });
          } else {
            // СТВОРЕННЯ НОВОЇ ВІДПОВІДІ
            await tx.answer.create({
              data: {
                content,
                is_correct: isCorrect,
                question_id: questionId,
              },
            });
          }
        }
      } else {
        // СТВОРЕННЯ НОВОГО ПИТАННЯ
        const type = question.type;
        const content = normalizeString(question.content);
        const points = Number(question.points);

        let questionData = {
          type,
          content,
          points,
          test_id: testIdNumber,
        };

        if (["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(type)) {
          let correctAnswer;
          if (type === "NUMBER") {
            correctAnswer = String(Number(question.correct_answer));
          } else {
            correctAnswer = String(question.correct_answer).trim();
          }
          questionData.correct_answer = correctAnswer;
        }

        const createdQuestion = await tx.question.create({
          data: questionData,
        });

        // СТВОРЕННЯ ВІДПОВІДЕЙ ДЛЯ НОВОГО ПИТАННЯ
        if (!["SHORT_TEXT", "LONG_TEXT", "NUMBER"].includes(type)) {
          for (const answer of question.answers) {
            const content = normalizeString(answer.content);
            const isCorrect = answer.is_correct;
            await tx.answer.create({
              data: {
                content,
                is_correct: isCorrect,
                question_id: createdQuestion.id,
              },
            });
          }
        }
      }
    }

    // ОТРИМАННЯ ДОСТУПНИХ ДОМЕНІВ(ВИДАЛЯЄМО СТАРІ ТА СТВОРЮЄМО НОВІ)
    await tx.allowedTestDomain.deleteMany({
      where: { test_id: testIdNumber },
    });
    if (validated.allowedDomains.length > 0) {
      await tx.allowedTestDomain.createMany({
        data: validated.allowedDomains.map((domain) => ({
          domain: normalizeString(domain),
          test_id: testIdNumber,
        })),
      });
    }

    // ОТРИМАННЯ ДОСТУПНИХ ПОШТ(ВИДАЛЯЄМО СТАРІ ТА СТВОРЮЄМО НОВІ)
    await tx.allowedTestEmail.deleteMany({
      where: { test_id: testIdNumber },
    });
    if (validated.allowedEmails.length > 0) {
      await tx.allowedTestEmail.createMany({
        data: validated.allowedEmails.map((email) => ({
          email: normalizeString(email),
          test_id: testIdNumber,
        })),
      });
    }

    // ПОВЕРНЕННЯ ОНОВЛЕНОГО ТЕСТУ
    const updatedTest = await tx.test.findUnique({
      where: { id: testIdNumber },
      include: {
        category: true,
        university: true,
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        questions: {
          include: {
            answers: true,
          },
        },
        allowed_test_domains: true,
        allowed_test_emails: true,
      },
    });

    return updatedTest;
  });
  // ПОВЕРНЕННЯ ТРАНЗАКЦІЇ
  return result;
};
