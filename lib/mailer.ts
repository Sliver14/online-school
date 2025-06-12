import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default async function sendVerificationEmail(email: string, name: string, url: string) {
    const html = `
        <h2>Hello ${name || "there"},</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${url}" target="_blank">${url}</a>
        <p>This link will expire in 24 hours.</p>
    `;

    await transporter.sendMail({
        from: `"Online Foundation School" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email",
        html,
    });
}
