import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendActivationMail = async (email, verifyToken) => {
  try {
    const link = `${process.env.API_URL}/api/auth/verify/${verifyToken}`;

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Активація акаунта на ${process.env.CLIENT_URL}`,
      html: `
        <div>
          <h1>Для активації перейдіть за посиланням</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
    });

    console.log("EMAIL SENT:", response);
    return response;
  } catch (error) {
    console.error("RESEND ERROR:", error);
    throw error;
  }
};
