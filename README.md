# KLYRO

A production-oriented multi-vendor marketplace backend built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**.

The project follows a layered architecture with a strong focus on **clean code**, **security**, **maintainability**, and **scalability**.

> 🚧 Project Status: Active Development

---

# Features

## ✅ Authentication

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

---

## ✅ Authorization

- Role-Based Authorization
- Protected Routes
- Seller Authorization
- Admin Authorization (Foundation)

---

## ✅ Seller Module

- Become a Seller
- Get Seller Profile
- Update Seller Profile
- Update Seller Logo
- Update Seller Banner
- Image Upload with ImageKit
- Automatic Old Image Cleanup
- MongoDB Transactions (Seller Creation)

---

# Tech Stack

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
| Image Storage | ImageKit |
| File Upload | Multer |
| Email | Nodemailer |
| Logging | Pino |
| Security | Helmet |

---

# Project Structure

```text
src/
├── config/
├── constants/
├── middlewares/
├── modules/
│   ├── auth/
│   └── seller/
├── types/
└── utils/
```

---

# Architecture

The project follows a layered architecture.

```text
Routes
    ↓
Authentication
    ↓
Authorization
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

### Responsibilities

- **Routes** → API definitions
- **Authentication** → Verify user identity
- **Authorization** → Check route permissions
- **Validation** → Validate incoming requests
- **Controllers** → Handle HTTP requests & responses
- **Services** → Business logic
- **Models** → Database interaction

---

# Security Features

- JWT Authentication
- Role-Based Authorization
- Refresh Token Rotation
- SHA-256 Hashed Refresh Tokens
- HTTP-only Cookies
- Secure Cookies (Production)
- SameSite Strict Cookies
- Password Hashing with bcrypt
- Helmet Security Headers
- Google OAuth 2.0
- Centralized Error Handling

---

# Authentication Flow

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

# Current Roadmap

- ✅ Authentication
- ✅ Authorization
- ✅ Seller Module
- 🚧 Product Module
- ⏳ Cart
- ⏳ Wishlist
- ⏳ Orders
- ⏳ Reviews
- ⏳ Dashboard
- ⏳ Redis Caching
- ⏳ Rate Limiting
- ⏳ Graceful Shutdown

---

# Installation

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

# Git Workflow

Each feature is developed in an isolated feature branch.

```text
main
│
├── feature/auth
├── feature/seller
├── feature/product
└── ...
```

Only tested and reviewed code is merged into `main`.

---

# Project Philosophy

- Production-First Development
- Business Rules First
- Feature-Based Architecture
- Separation of Concerns
- Secure by Default
- Reusable Components
- Scalable Design
- Maintainable Codebase

---

# License

This project is developed for learning production-grade backend architecture and modern software engineering practices.