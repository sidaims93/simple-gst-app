import transporter from "./config.js";
import fs from "fs";
import ejs from "ejs";

const email_verify_template = fs.readFileSync(
  "./email/templates/verify_email.ejs",
  "utf8",
);

export default async function sendEmailVerificationEmail(
  name,
  hmac,
  to,
  timeStamp,
) {
  // hmac will be verifyied at the verification end.
  const htmlContent = ejs.render(email_verify_template, {
    name,
    hmac,
    to,
    timeStamp,
  });
  const mailOptions = {
    from: "GST APP <" + process.env.EMAIL_ADDR + ">",
    to,
    subject: "Verify email",
    html: htmlContent,
  };
  await transporter.sendMail(mailOptions);
}
