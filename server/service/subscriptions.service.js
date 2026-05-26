import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";

export const createSession = async (userId, stripePriceId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw ApiError.notFound("Користувача не знайдено.");
  }

  const price = await prisma.price.findUnique({
    where: {
      stripe_price_id: stripePriceId,
    },
    include: {
      product: true,
    },
  });

  if (!price || !price.active) {
    throw ApiError.badRequest("stripePriceId не валідний");
  }

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.first_name + " " + user.last_name,
    });

    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        stripeCustomerId,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    mode: "subscription",
    locale: "en",
    line_items: [
      {
        price: price.stripe_price_id,
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    metadata: { userId },
  });

  return { sessionId: session.id, url: session.url };
};

export const cancelSubscription = async (userId, subscriptionId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("Користувача не знайдено.");

  const activeSub = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      user_id: userId,
      status: { in: ["ACTIVE", "PAST_DUE"] },
    },
  });

  if (!activeSub || !activeSub.stripe_subscription_id) {
    throw ApiError.badRequest("У вас немає активної підписки для скасування.");
  }

  let updatedSub;

  if (activeSub.status === "PAST_DUE") {
    await stripe.subscriptions.cancel(activeSub.stripe_subscription_id);

    updatedSub = await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        status: "CANCELED",
        cancel_at_period_end: false,
      },
    });
  } else {
    await stripe.subscriptions.update(activeSub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    updatedSub = await prisma.subscription.update({
      where: { id: activeSub.id },
      data: { cancel_at_period_end: true },
    });
  }

  return updatedSub;
};

export const openCustomerPortal = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("Користувача не знайдено.");

  if (!user.stripeCustomerId) {
    throw ApiError.badRequest("У користувача немає stripeCustomerId.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    locale: "en",
    return_url: `${process.env.CLIENT_URL}/subscription/my`,
  });

  return { url: session.url };
};

export const getPlans = async () => {
  const prices = await prisma.price.findMany({ include: { product: true } });
  return prices.map((p) => ({
    stripePriceId: p.stripe_price_id,
    amount: p.amount,
    currency: p.currency,
    interval: p.interval,
    active: p.active,
    product: {
      stripeProductId: p.product.stripe_product_id,
      name: p.product.name,
      description: p.product.description,
    },
  }));
};

export const getMyActiveSubscription = async (userId) => {
  const activeSub = await prisma.subscription.findMany({
    where: {
      user_id: userId,
      OR: [
        {
          status: "ACTIVE",
          current_period_end: { gte: new Date() },
        },
        {
          status: "PAST_DUE",
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { price: { include: { product: true } } },
  });

  return activeSub;
};

export const getSubscriptionHistory = async (userId) => {
  const subs = await prisma.subscription.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    include: { price: { include: { product: true } } },
  });

  return subs;
};

export const handleWebhook = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw ApiError.badRequest(
      `Webhook signature verification failed: ${err.message}`,
    );
  }

  try {
    switch (event.type) {
      // 1. Створення підписки після успішного Checkout
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;

        const userId = parseInt(session.metadata.userId);
        const stripeSub = await stripe.subscriptions.retrieve(
          session.subscription,
        );

        const currPeriodEnd = stripeSub.items.data[0].current_period_end;

        // Перевіряємо чи підписка вже існує
        const existingSub = await prisma.subscription.findUnique({
          where: { stripe_subscription_id: stripeSub.id },
        });

        if (!existingSub) {
          await prisma.subscription.create({
            data: {
              user_id: userId,
              stripe_subscription_id: stripeSub.id,
              stripe_price_id: stripeSub.items.data[0].price.id,
              status: "ACTIVE",
              current_period_end: new Date(currPeriodEnd * 1000),
              cancel_at_period_end: stripeSub.cancel_at_period_end,
            },
          });
        }
        break;
      }

      // 2. Успішне зняття грошей
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        const stripeSub = await stripe.subscriptions.retrieve(
          invoice.subscription,
        );

        const currPeriodEnd = stripeSub.items.data[0].current_period_end;

        await prisma.subscription.upsert({
          where: { stripe_subscription_id: invoice.subscription },
          update: {
            status: "ACTIVE",
            current_period_end: new Date(stripeSub.current_period_end * 1000),
            cancel_at_period_end: stripeSub.cancel_at_period_end,
          },
          // Якщо раптом подія інвойсу прийшла раніше завершення сесії
          create: {
            user_id: await getUserIdFromCustomer(invoice.customer),
            stripe_subscription_id: stripeSub.id,
            stripe_price_id: stripeSub.items.data[0].price.id,
            status: "ACTIVE",
            current_period_end: new Date(currPeriodEnd * 1000),
          },
        });
        break;
      }

      // 3. Помилка оплати
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        await prisma.subscription.updateMany({
          where: { stripe_subscription_id: invoice.subscription },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      // 4. Зміна параметрів підписки на стороні Stripe
      case "customer.subscription.updated": {
        const stripeSub = event.data.object;
        console.log(stripeSub);

        let localStatus = "ACTIVE";
        if (stripeSub.status === "past_due") localStatus = "PAST_DUE";
        if (stripeSub.status === "unpaid") localStatus = "UNPAID";
        if (stripeSub.status === "canceled") localStatus = "CANCELED";

        const currPeriodEnd = stripeSub.items.data[0].current_period_end;

        const isActuallyCancelled = Boolean(
          stripeSub.cancel_at_period_end || stripeSub.cancel_at,
        );

        await prisma.subscription.updateMany({
          where: { stripe_subscription_id: stripeSub.id },
          data: {
            status: localStatus,
            stripe_price_id: stripeSub.items.data[0].price.id,
            current_period_end: new Date(currPeriodEnd * 1000),
            cancel_at_period_end: isActuallyCancelled,
          },
        });
        break;
      }

      // 5. Повне видалення підписки
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;

        await prisma.subscription.updateMany({
          where: { stripe_subscription_id: stripeSub.id },
          data: { status: "CANCELED" },
        });
        break;
      }
    }
  } catch (error) {
    throw ApiError.badRequest(`Webhook handling error: ${error.message}`);
  }

  return { received: true };
};

const getUserIdFromCustomer = async (stripeCustomerId) => {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId },
  });
  if (!user)
    throw new Error(`User with stripeCustomerId ${stripeCustomerId} not found`);
  return user.id;
};
