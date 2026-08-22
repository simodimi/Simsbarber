const Mailjet = require("node-mailjet");
require("dotenv").config();
const mailjet = Mailjet.apiConnect(
  process.env.EMAIL_USER,
  process.env.EMAIL_PASSWORD,
);

async function envoyerEmail({ to, subject, html }) {
  return await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_FROM_EMAIL,
          Name: process.env.EMAIL_FROM_NAME,
        },
        To: [{ Email: to }],
        Subject: subject,
        HTMLPart: html,
      },
    ],
  });
}
module.exports = { envoyerEmail, mailjet };
