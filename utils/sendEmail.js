const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config(); // Ensure environment variables are loaded

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use 'Gmail' or replace with 'SendGrid'/'Mailgun' setup
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"Pabsoft Taskman" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password - Pabsoft Taskman',
    text: `
You requested a password reset.

Click the link below to reset your password:
${resetLink}

If you didn’t request this, you can ignore this email.
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password for your MyApp account.</p>
        <p>
          <a href="${resetLink}" style="background: #0052cc; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>If that button doesn't work, copy and paste this link in your browser:</p>
        <p style="word-break: break-all;">${resetLink}</p>
        <p>If you didn’t request this, just ignore this message.</p>
        <br />
        <p>– Pabsoft Taskman Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
