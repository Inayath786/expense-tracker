const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  // create reusable transporter object
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "inayatharifa@gmail.com",
      pass: "ineb eszr runf ulgg"  // App password, not your Gmail login password
    }
  });

  // send mail
  await transporter.sendMail({
    from: '"Expense Tracker" inayatharifa@gmail.com',
    to,
    subject,
    text
  });

  console.log("✅ Email sent successfully to", to);
}

module.exports = sendEmail;
