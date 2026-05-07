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
