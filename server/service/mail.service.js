import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendActivationMail = async (email, verifyToken) => {
  const link = `${process.env.API_URL}/api/auth/verify/${verifyToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Активація акаунта на ${process.env.CLIENT_URL}`,
    text: "",
    html: `
      <div>
        <h1>Для активації перейдіть за посиланням</h1>
        <a href="${link}">${link}</a>
      </div>
    `,
  });
};
