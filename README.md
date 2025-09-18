This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# Online Foundation School

This is an online learning platform built with Next.js, designed to provide a modern, interactive foundation school experience. The project features authentication, class management, assessments, progress tracking, and more.

## Features

- User authentication (sign up, sign in, password reset, email verification)
- Class and exam management
- Assessment and progress tracking
- Video player integration
- Responsive dashboard and sidebar navigation
- Email notifications

## Technologies Used

- **Next.js** (React framework)
- **React** (UI library)
- **TypeScript** (type safety)
- **Tailwind CSS** (utility-first CSS framework)
- **Prisma** (ORM for database management)
- **MySQL** (database)
- **Axios** (HTTP client)
- **Nodemailer** (email sending)
- **Lottie-react** (animations)
- **Lucide-react** (icons)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (JWT authentication)
- **js-cookie** (cookie management)
- **react-hot-toast** and **react-toastify** (notifications)
- **uuid** (unique IDs)
- **PostCSS** and **Autoprefixer** (CSS processing)
- **ESLint** (linting)
- **@faker-js/faker** (data seeding/testing)

## Getting Started

1. Install dependencies:
	```bash
	npm install
	```
2. Run the development server:
	```bash
	npm run dev
	```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Main application code (pages, components, context)
- `lib/` - Utility functions (auth, mailer, constants, prisma)
- `prisma/` - Database schema and migrations
- `public/` - Static assets
- `utils/` - Helper modules

## License

This project is for educational purposes.
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
