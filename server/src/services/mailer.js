import { createTransport } from "nodemailer";

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: "testpitest7@gmail.com",
        pass: "pwivpghsslwzzdmi",
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    await transporter.sendMail({
      from: "testpitest7@gmail.com",
      to: email,
      subject: subject,
      html: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};

export default sendEmail;
