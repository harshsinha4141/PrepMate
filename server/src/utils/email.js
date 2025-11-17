import nodemailer from "nodemailer";

// Generic reusable email sender
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // for dev, you can use SMTP for production
      auth: {
        user: process.env.EMAIL_USER,  // Gmail / SMTP user
        pass: process.env.EMAIL_PASS,  // App password
      },
    });

    const mailOptions = {
      from: `"PrepMate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to} | Subject: ${subject}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// Specialized welcome email using sendEmail()
export const sendWelcomeEmail = async (toEmail, name) => {
  const html = `
    <h2>Hi ${name},</h2>
    <p>Welcome to <b>PrepMate</b> – your Free Interview Practice Platform 🚀</p>
    
    <p>You’ve been credited with <b>100 free coins</b> to start your journey 🎉</p>
    
    <p>On PrepMate, you can prepare for:</p>
    <ul>
      <li>👨‍💻 Software Developer & Tech Interviews</li>
      <li>📚 UPSC & Civil Services</li>
      <li>🪖 SSB Interviews for NDA, CDS, AFCAT</li>
      <li>🎯 And many more competitive exams</li>
    </ul>
    
    <p>Not just practice — you also get to <b>learn from peers</b> preparing for the same exams, share experiences, and grow together 💪</p>
    
    <br/>
    <p>Happy Interviewing & Best of Luck! 🎯</p>
    <p>— The PrepMate Team 💙</p>
  `;
  
  await sendEmail(toEmail, "Welcome to PrepMate 🎉", html);
};

