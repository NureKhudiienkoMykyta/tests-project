import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendActivationMail = async (email, verifyToken) => {
  try {
    const link = `${process.env.API_URL}/api/auth/verify/${verifyToken}`;

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: "Активація акаунта",
      htmlContent: `
        <html>
          <body>
            <h2>Підтвердіть акаунт</h2>
            <a href="${link}">${link}</a>
          </body>
        </html>
      `,
      sender: {
        name: "Quiz Bee",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email,
        },
      ],
    });

    console.log("EMAIL SENT:", result);
    return result;
  } catch (error) {
    console.error("BREVO ERROR:", error);
    throw error;
  }
};
