# KLYRO Architecture

## Overview

Klyro is a production-oriented fashion e-commerce backend built with scalability, maintainability, and security as first-class goals.

The project follows a layered architecture where every layer has a single responsibility. Business logic is isolated from HTTP concerns, validation is centralized, and authentication is designed around secure JWT-based sessions.

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* Zod
* JWT
* Redis (Planned)
* ImageKit (Planned)
* Nodemailer (Planned)

---

# Project Structure

```text
src/
│
├── config/
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── product/
│   ├── cart/
│   ├── order/
│   └── ...
│
├── middlewares/
│
├── utils/
│
├── types/
│
└── app.ts
```

---

# Architecture Principles

## 1. Thin Controllers

Controllers should never contain business logic.

Responsibilities:

* Receive request
* Call service
* Return response
* Set cookies
* Handle HTTP concerns

Business rules always belong inside services.

---

## 2. Services

Services contain all application logic.

Examples:

* Login
* Register
* Refresh Token
* Order Creation
* Product Creation

Services should not know anything about Express request or response objects.

---

## 3. Validation Layer

Every incoming request is validated before reaching the controller.

Validation is performed using Zod.

Invalid requests never reach business logic.

---

## 4. Error Handling

The application uses centralized error handling.

Business logic throws `ApiError`.

Controllers never manually build error responses.

All errors are handled by the global error middleware.

---

## 5. Utilities

Shared logic is extracted into reusable utilities.

Examples:

* JWT verification
* Refresh token hashing
* Async handler
* API response wrapper

Utilities should remain stateless.

---

# Authentication Architecture

Authentication uses JWT with HTTP-only cookies.

Two different tokens are used.

## Access Token

Purpose

Authenticate protected API requests.

Contains

* User ID
* User Role

Lifetime

15 minutes

---

## Refresh Token

Purpose

Generate a new access token.

Contains

* User ID

Lifetime

7 days

---

# Why Two Tokens?

Using a short-lived access token limits the impact of token theft.

A long-lived refresh token provides a better user experience without requiring frequent logins.

---

# Refresh Token Rotation

Every refresh request generates:

* New Access Token
* New Refresh Token

The previous refresh token immediately becomes invalid.

This reduces the risk of replay attacks using older refresh tokens.

---

# Refresh Token Storage

Refresh tokens are **never stored in plain text**.

Instead:

1. Generate Refresh Token
2. Hash using SHA-256
3. Store hash in the database
4. Send original token to the client

During refresh:

1. Client sends original refresh token
2. Server hashes it
3. Compare with stored hash
4. Continue only if hashes match

This protects refresh tokens if the database is compromised.

---

# Cookies

Authentication tokens are stored inside HTTP-only cookies.

Cookie configuration:

* httpOnly
* secure (Production)
* sameSite = strict

Reasons:

* Prevent JavaScript access
* Reduce XSS impact
* Improve security

---

# Authorization

Authentication and authorization are separate concerns.

Authentication

Who is the user?

Authorization

What is the user allowed to do?

Authorization will be implemented using role-based middleware.

Example:

```text
authenticate

↓

authorize("ADMIN")

↓

Controller
```

---

# Password Security

Passwords are hashed using bcrypt before storage.

Password comparison is performed using bcrypt.compare().

Passwords are never returned in API responses.

---

# Validation Strategy

Every endpoint has its own Zod schema.

Example:

* Register
* Login
* Product Creation
* Update Product

Controllers receive already validated data.

---

# API Design

The project follows RESTful conventions.

Examples:

```text
POST   /auth/register

POST   /auth/login

POST   /auth/refresh

POST   /auth/logout

GET    /auth/me
```

Future modules follow the same conventions.

---

# Database Design

MongoDB is used with Mongoose.

Each module owns its schema.

Relationships use ObjectId references.

Indexes will be added for:

* Email
* Product Search
* Categories
* Orders
* User Lookups

---

# Security

Current

* Password Hashing
* JWT Authentication
* HTTP-only Cookies
* Refresh Token Hashing
* Refresh Token Rotation
* Input Validation
* Centralized Error Handling

Planned

* Refresh Token Reuse Detection
* Multi-device Sessions
* Rate Limiting
* Helmet
* CORS Hardening
* Audit Logs
* Login History

---

# Redis Roadmap

Redis will be introduced only where it provides measurable value.

Planned use cases:

* Product Cache
* Search Cache
* Rate Limiting
* OTP Storage
* Inventory Locking
* Cache Invalidation

Redis will not be introduced prematurely.

---

# Design Philosophy

The project follows a practical engineering approach.

Priorities:

1. Correctness
2. Maintainability
3. Security
4. Reliability
5. Scalability

Features are implemented first.

Refactoring is performed after logical milestones rather than continuously changing working code.

---

# Development Workflow

Every feature follows the same lifecycle.

1. Design
2. Validation
3. Service
4. Controller
5. Route
6. Testing
7. Review
8. Commit
9. Push

---

# Future Improvements

* Response DTOs
* Environment Validation with Zod
* Multi-device Sessions
* Audit Logging
* Distributed Caching
* Monitoring
* Background Jobs
* Event-driven Notifications

---

# Guiding Principle

Every architectural decision should optimize for:

* Simplicity
* Readability
* Security
* Testability
* Long-term maintainability

The project intentionally avoids unnecessary abstractions and introduces complexity only when it solves a real engineering problem.
