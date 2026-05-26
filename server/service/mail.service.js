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
  transporter.verify((error, success) => {
    if (error) {
      console.log("SMTP ERROR:", error);
    } else {
      console.log("SMTP READY");
    }
  });

  try {
    const link = `${process.env.API_URL}/api/auth/verify/${verifyToken}`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Активація акаунта на ${process.env.CLIENT_URL}`,
      html: `
        <div>
          <h1>Для активації перейдіть за посиланням</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
    });

    console.log("Mail sent:", info.response);
  } catch (error) {
    console.error("MAIL ERROR:", error);
  }
};
