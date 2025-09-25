# LoveWorld Foundation School Online

A modern online school platform for LoveWorld Foundation School, enabling students to take classes, watch videos, complete assessments, and track their progress. The platform features secure authentication, class unlocking logic, real-time timers, and a smooth user experience for both Desktop and mobile views.

## Demo

- [Live Demo](https://online-school-olive.vercel.app/)

## Screenshots

### Welcome Page
![Welcome Page](https://res.cloudinary.com/dfi8bpolg/image/upload/v1758575897/gzxqhpop7itbukgan7zx.png)

### Authentication
![Authentication](https://res.cloudinary.com/dfi8bpolg/image/upload/v1758577427/lphwxvcgzgwspmw1zqb2.png)

### Dashboard
![Dashboard](https://res.cloudinary.com/dfi8bpolg/image/upload/v1758577088/dbp6teqzzbi6b3vybuxx.png)

### Classes
![Classes](https://res.cloudinary.com/dfi8bpolg/image/upload/v1758577427/x068uq6y6vra8nwaxnb3.png)

### Assessments
![Assessments](https://res.cloudinary.com/dfi8bpolg/image/upload/v1758577088/kjretdzhujrjtup0lkkg.png)


## Features

- JWT Authentication (Sign up, Sign in, Password Reset)
- Class Unlocking based on video completion, assessment passing, and timers
- Assessment system with instant feedback and image support
- Real-time countdown timers for class unlocking
- Progress tracking for videos and assessments
- Responsive UI for desktop and mobile
- Admin seeding and resource management
- Service Worker for offline support
- Clean, modern UI with Tailwind CSS

## Tech Stack

- React / Next.js (App Router)
- Tailwind CSS
- Node.js + Prisma ORM
- MySQL
- React Query & Context API


## Installation

```bash
git clone https://github.com/your-username/project-name
cd project-name
npm install
npm run dev
```

## Project Structure

- `app/` - Next.js app directory (pages, components, context, hooks)
- `lib/` - Utility libraries (auth, mailer, constants)
- `prisma/` - Prisma schema, migrations, and seed data
- `public/` - Static assets (images, icons, etc.)
- `utils/` - Country/zone helpers, email utilities

## Environment Variables

Create a `.env` file in the root with the following:

```
DATABASE_URL=mysql://user:password@localhost:3306/dbname
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

## Database Setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

## Running the App

```bash
npm run dev
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
