import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("🌱 Початок ініціалізації тарифних планів...");

  // 1. Тариф: Premium на 1 місяць
  await prisma.product.upsert({
    where: { stripe_product_id: "prod_UXaIL85xF3nZsi" },
    update: {}, // Якщо продукт є, нічого не оновлюємо
    create: {
      stripe_product_id: "prod_UXaIL85xF3nZsi",
      name: "Premium доступ на 1 місяць",
      description:
        "Повний доступ до всіх тестів та функцій антисписування на 30 днів",
      active: true,
      prices: {
        create: [
          {
            stripe_price_id: "price_1TYV8MJetQeM459bWIPhT4T0",
            amount: 15000, // наприклад, 150.00 грн (в копійках)
            currency: "uah",
            interval: "month",
            active: true,
          },
        ],
      },
    },
  });

  // 2. Тариф: Premium на 1 рік
  await prisma.product.upsert({
    where: { stripe_product_id: "prod_UXaKDtj6CVRUJC" },
    update: {}, // Якщо продукт є, нічого не оновлюємо
    create: {
      stripe_product_id: "prod_UXaKDtj6CVRUJC",
      name: "Premium доступ на 1 рік",
      description:
        "Вигідний пакет: повний Premium доступ на 365 днів для максимальної підготовки",
      active: true,
      prices: {
        create: [
          {
            stripe_price_id: "price_1TYV9sJetQeM459bsuuAon3B",
            amount: 120000, // наприклад, 1200.00 грн (в копійках)
            currency: "uah",
            interval: "year",
            active: true,
          },
        ],
      },
    },
  });

  console.log("✅ Тарифні плани успішно синхронізовано з БД!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Помилка під час сидингу:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
