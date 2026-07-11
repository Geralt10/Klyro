# KLYRO

A production-oriented multi-vendor marketplace backend built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**.

The project follows a layered architecture with a strong focus on clean code, security, scalability, and maintainability.

> 🚧 Project Status: Active Development

---

## Features

### ✅ Authentication

- User Registration
- User Login
- Google OAuth (Authorization Code Flow)
- Email Verification
- Resend Verification Email
- Forgot Password
- Reset Password
- Change Password
- Refresh Token Rotation
- Logout
- Get Current User

### 🚧 Upcoming

- Seller Module
- Product Module
- Cart
- Wishlist
- Orders
- Reviews
- Dashboard
- Redis Caching
- Rate Limiting
- Graceful Shutdown

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Validation | Zod |
| Authentication | JWT |
| OAuth | Google OAuth 2.0 |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Logging | Pino |
| Security | Helmet |

---

## Project Structure

```text
src/
├── config/
├── constants/
├── middlewares/
├── modules/
│   └── auth/
├── types/
└── utils/
```

The project follows a layered architecture:

```text
Route
    ↓
Validation
    ↓
Controller
    ↓
Service
    ↓
Model
    ↓
MongoDB
```

Business logic lives inside **Services**, while Controllers only handle HTTP requests and responses.

---

## Security Features

- JWT Authentication
- Refresh Token Rotation
- SHA256 Hashed Refresh Tokens
- HTTP-only Cookies
- Secure Cookies (Production)
- SameSite Strict Cookies
- Password Hashing with bcrypt
- Google Authorization Code Flow
- Helmet Security Headers
- Centralized Error Handling

---

## Authentication Flow

```text
Register
    ↓
Email Verification
    ↓
Login
    ↓
Access Token (15 min)
+
Refresh Token (7 days)
    ↓
Authenticated Requests
```

---

## Current Roadmap

- ✅ Authentication
- 🚧 Seller Module
- ⏳ Product Module
- ⏳ Cart
- ⏳ Wishlist
- ⏳ Orders
- ⏳ Reviews
- ⏳ Dashboard
- ⏳ Redis
- ⏳ Rate Limiting
- ⏳ Graceful Shutdown

---

## Installation

```bash
git clone <repository-url>

cd klyro

npm install
```

Create a `.env` file using `.env.example`.

Run the development server:

```bash
npm run dev
```

---

## Git Workflow

Each feature is developed in an isolated feature branch.

Example:

```text
main
│
├── feature/auth
├── feature/seller
├── feature/product
├── feature/order
└── ...
```

Only tested and reviewed code is merged into `main`.

---

## Project Philosophy

- Production-first architecture
- Business Rules First
- Clean Architecture
- Feature-based Modules
- Separation of Concerns
- Secure by Default
- Scalable Design
- Maintainable Codebase

---

## Current Status

### Completed

- Authentication Module
- Google OAuth
- Helmet Integration
- Pino Logger
- Centralized Error Handling

### In Progress

- Seller Module

---

## License

This project is developed for learning production-grade backend architecture and modern software engineering practices.