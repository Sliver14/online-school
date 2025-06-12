import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = await req.json();

        if (!firstName || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_APP_URL || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        const hashedPassword = bcrypt.hashSync(password, 10);
        const verificationToken = uuidv4();


        if (existingUser) {
            if (existingUser.verified) {
                return NextResponse.json({ error: "User already verified" }, { status: 400 });
            } else {
                // Update existing unverified user
                await prisma.user.update({
                    where: { email },
                    data: {
                        firstName,
                        lastName,
                        password: hashedPassword,
                        verificationToken,
                        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    },
                });
            }
        } else {
            // Create new user
            await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    verificationToken,
                    verified: false,
                    verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });
        }

        
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signup/verify?token=${verificationToken}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verify your email",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Email Verification</title>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                background-color: #f4f4f4;
                            }
                            
                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: #ffffff;
                                border-radius: 10px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                overflow: hidden;
                            }
                            
                            .header {
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }
                            
                            .header h1 {
                                font-size: 28px;
                                font-weight: 300;
                                margin-bottom: 10px;
                            }
                            
                            .header p {
                                font-size: 16px;
                                opacity: 0.9;
                            }
                            
                            .content {
                                padding: 40px 30px;
                            }
                            
                            .greeting {
                                font-size: 18px;
                                color: #333;
                                margin-bottom: 20px;
                            }
                            
                            .message {
                                font-size: 16px;
                                color: #666;
                                margin-bottom: 30px;
                                line-height: 1.8;
                            }
                            
                            .button-container {
                                text-align: center;
                                margin: 40px 0;
                            }
                            
                            .verify-button {
                                display: inline-block;
                                padding: 16px 32px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: #ffffff !important;
                                text-decoration: none;
                                border-radius: 50px;
                                font-size: 16px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                                border: none;
                                cursor: pointer;
                            }
                            
                            .verify-button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                            }
                            
                            .alternative-link {
                                margin: 30px 0;
                                padding: 20px;
                                background-color: #f8f9fa;
                                border-radius: 8px;
                                border-left: 4px solid #667eea;
                            }
                            
                            .alternative-link p {
                                font-size: 14px;
                                color: #666;
                                margin-bottom: 10px;
                            }
                            
                            .alternative-link a {
                                color: #667eea;
                                word-break: break-all;
                                text-decoration: none;
                            }
                            
                            .footer {
                                background-color: #f8f9fa;
                                padding: 30px;
                                text-align: center;
                                border-top: 1px solid #e9ecef;
                            }
                            
                            .footer p {
                                font-size: 14px;
                                color: #666;
                                margin-bottom: 5px;
                            }
                            
                            .expiry-notice {
                                background-color: #fff3cd;
                                border: 1px solid #ffeaa7;
                                border-radius: 8px;
                                padding: 15px;
                                margin: 20px 0;
                                text-align: center;
                            }
                            
                            .expiry-notice p {
                                color: #856404;
                                font-size: 14px;
                                margin: 0;
                                font-weight: 500;
                            }
                            
                            .security-note {
                                margin-top: 30px;
                                padding: 20px;
                                background-color: #e8f4f8;
                                border-radius: 8px;
                                border-left: 4px solid #17a2b8;
                            }
                            
                            .security-note p {
                                font-size: 14px;
                                color: #0c5460;
                                margin: 0;
                            }
                            
                            @media only screen and (max-width: 600px) {
                                .email-container {
                                    margin: 0;
                                    border-radius: 0;
                                }
                                
                                .header, .content, .footer {
                                    padding: 20px;
                                }
                                
                                .header h1 {
                                    font-size: 24px;
                                }
                                
                                .verify-button {
                                    padding: 14px 28px;
                                    font-size: 14px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <h1>Welcome to Loveworld Foundation School</h1>
                                <p>Please verify your email address to get started</p>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">
                                    Hello ${firstName},
                                </div>
                                
                                <div class="message">
                                    Thank you for registering with Loveworld Foundation School Inc. To complete your registration and secure your account, please verify your email address by clicking the button below.
                                </div>
                                
                                <div class="button-container">
                                    <a href="${verificationLink}" class="verify-button">
                                        Verify Email Address
                                    </a>
                                </div>
                                
                                <div class="expiry-notice">
                                    <p>⏰ This verification link will expire in 24 hours</p>
                                </div>
                                
                                <div class="alternative-link">
                                    <p><strong>Having trouble with the button?</strong></p>
                                    <p>Copy and paste this link into your browser:</p>
                                    <a href="${verificationLink}">${verificationLink}</a>
                                </div>
                                
                                <div class="security-note">
                                    <p><strong>🔒 Security Note:</strong> If you didn't create an account with us, please ignore this email. Your email address will not be added to our system.</p>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p><strong>Loveworld Foundation School Inc.</strong></p>
                                <p>Preparing the Saints for Ministry</p>
                                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                                    This is an automated message, please do not reply to this email.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            });
            
            console.log(`Beautiful verification email sent successfully to ${email}`);
        } catch (emailError) {
            // Log error but don't fail the registration
            console.error("Email sending failed:", emailError);
            return NextResponse.json({ 
                message: "User created but email sending failed. Please contact support."
            }, { status: 201 });
        }

        return NextResponse.json({ message: "Verification link sent to your email." }, { status: 201 });

    } catch (error) {
        console.error("Signup Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}