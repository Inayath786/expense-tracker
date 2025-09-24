const { json } = require("express");
const { mongo, version } = require("mongoose");
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


// version: "3.8"

// services:
//   frontend
//     build: ./frontend
//     ports:
//       - "3000:3000"
//     volumes:
//       - ./frontend:/usr/src/app
//     depends:
//       - backend
   
//   backend:
//     build: ./backend
//     ports:
//       -"4000:4000"
//     volumes:
//       - ./backend:/usr/src/app
//     depends_on: 
//       - mysql
//     environment:
//       DB_HOST="mysql"
//       DB_USER="root"
//       DB_PASSWORD="secret"
//       DB_NAME="ecommerce"

//   mysql:
//     image: mysql:8.0
//     ports:
//       -"3306:3306"
//     environment:
//       DATABASE_NAME="ecommerce"
//       USERNAME="root"
//       PASSWORD="secret"
//     volumes:
//       - mysqldata:/data/db        
  
//   volumes:
//     mysqldata:     

        