const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Wrap in an async IIFE so we can use await.
// exports.sentMail = async (options) => {
//   const info = await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: options.email,
//     subject: options.subject,
//     text: options.text,
//     html: options.html,
//   });
// };



// const transporter = nodemailer.createTransport({
//   host: "pro.turbo-smtp.com",
//   port: 587,                  
//   secure: false,              
//   auth: {
//     user: process.env.TURBO_USER, 
//     pass: process.env.TURBO_PASS,
//   },
// });

// exports.sendMail = async (options) => {
//   const info = await transporter.sendMail({
//     from: process.env.TURBO_USER,
//     to: options.email,
//     subject: options.subject,
//     text: options.text,
//     html: options.html,
//   });
//   console.log("Message sent:", info.messageId);
// };


const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,               
  secure: false,
  auth: {
    user: "postmaster@sandbox12345.mailgun.org",
    pass: process.env.MAILGUN_PASS,            
  },
});

exports.sendMail = async (options) => {
  const info = await transporter.sendMail({
    from: "adelugbaolanrewaju@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  console.log("Message sent:", info.messageId);
};
