import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const normalizeDateKey = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.toISOString();
};

export const getUserDashboardStats = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw ApiError.notFound("Користувача не знайдено");
  }

  const attempts = await prisma.testAttempt.findMany({
    where: {
      user_id: userId,
      status: { in: ["COMPLETED", "EXPIRED"] },
    },
    select: {
      score: true,
      max_score: true,
      finished_at: true,
      started_at: true,
    },
    orderBy: {
      finished_at: "desc",
    },
  });

  const attemptsCount = attempts.length;

  const averageScore = attemptsCount
    ? Number(
        (
          attempts.reduce((sum, attempt) => {
            const maxScore = attempt.max_score || 0;
            const percent = maxScore > 0 ? (attempt.score / maxScore) * 100 : 0;
            return sum + percent;
          }, 0) / attemptsCount
        ).toFixed(1),
      )
    : 0;

  const attemptDays = new Set(
    attempts
      .map((attempt) => attempt.finished_at || attempt.started_at)
      .filter(Boolean)
      .map(normalizeDateKey),
  );

  let currentStreak = 0;
  if (attemptDays.size > 0) {
    const sortedDays = Array.from(attemptDays).sort((a, b) =>
      b.localeCompare(a),
    );
    let streakDate = new Date(sortedDays[0]);
    streakDate.setHours(0, 0, 0, 0);

    while (attemptDays.has(streakDate.toISOString())) {
      currentStreak += 1;
      streakDate.setDate(streakDate.getDate() - 1);
    }
  }

  return {
    attemptsCount,
    averageScore,
    currentStreak,
  };
};
