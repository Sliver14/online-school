import nodemailer from "nodemailer";

export async function sendEmail(
    email: string,
    firstName: string,
    link: string,
    type: "signup" | "resend" | "reset"
) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false },
        });

        const subject =
            type === "signup"
                ? "Verify Your Email"
                : type === "resend"
                    ? "Resend Verification Email"
                    : "Reset Your Password";
        const greeting = type === "reset" ? `Hello,` : `Hello ${firstName},`;
        const message =
            type === "signup"
                ? `Welcome to Loveworld Foundation School! Please verify your email by clicking the button below.`
                : type === "resend"
                    ? `Your email verification link has been resent. Please verify your email by clicking the button below.`
                    : `You requested a password reset for your Loveworld Foundation School account. Click the button below to reset your password.`;

        await transporter.sendMail({
            from: `"Loveworld Foundation School" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 20px; text-align: center; }
            .header h1 { font-size: 24px; font-weight: 600; }
            .content { padding: 20px; }
            .greeting { font-size: 16px; margin-bottom: 10px; }
            .message { font-size: 14px; color: #666; margin-bottom: 20px; }
            .button-container { text-align: center; margin: 20px 0; }
            .verify-button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; text-decoration: none; border-radius: 25px; font-size: 14px; font-weight: 600; }
            .verify-button:hover { background: linear-gradient(135deg, #764ba2, #667eea); }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .link { color: #667eea; word-break: break-all; text-decoration: none; }
            @media (max-width: 600px) { .header h1 { font-size: 20px; } .content { padding: 15px; } .verify-button { padding: 10px 20px; font-size: 12px; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Loveworld Foundation School</h1>
            </div>
            <div class="content">
              <div class="greeting">${greeting}</div>
              <div class="message">${message}</div>
              <div class="button-container">
                <a href="${link}" class="verify-button">${
                type === "reset" ? "Reset Password" : "Verify Email"
            }</a>
              </div>
              <div class="message">
                Or copy this link: <a href="${link}" class="link">${link}</a>
              </div>
            </div>
            <div class="footer">
              <p>This link expires in 24 hours. If you didn’t request this, ignore this email.</p>
              <p>Loveworld Foundation School Inc.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        console.log(`${type} email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending ${type} email:`, error);
        throw new Error(`Failed to send ${type} email`);
    }
}