# KLYRO Project Roadmap (Part 1)

# Overview

KLYRO is a production-oriented multi-vendor marketplace backend built using **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**.

The primary objective of this project is **not just building APIs**, but learning how production-grade backend systems are designed, implemented, secured, documented, reviewed, and maintained.

Every module is developed by following real-world software engineering practices instead of tutorial-style development.

---

# Project Vision

KLYRO aims to simulate the architecture of a real multi-vendor marketplace.

The project emphasizes:

* Clean Architecture
* Business-Driven Design
* Production-Oriented Development
* Maintainability
* Security
* Scalability
* Reusability
* Proper Documentation

Every architecture decision is discussed before implementation.

---

# Development Philosophy

Every module follows the same engineering process.

```text
Business Discussion
        ↓
Business Rules
        ↓
Architecture Design
        ↓
Database Design
        ↓
API Design
        ↓
Validation
        ↓
Business Logic
        ↓
Controllers
        ↓
Routes
        ↓
Testing
        ↓
Documentation
        ↓
Code Review
        ↓
Merge
```

No implementation begins before business rules are finalized.

---

# Core Engineering Principles

## Business Rules First

Business requirements always define the implementation.

The database and APIs are designed only after the business flow is completely understood.

---

## Layered Architecture

Every request follows a fixed pipeline.

```text
Client
    ↓
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

Each layer has a single responsibility.

---

## Thin Controllers

Controllers never contain business logic.

Responsibilities:

* Receive Request
* Extract Data
* Call Service
* Return Response

---

## Service Layer

The Service layer contains all business rules.

Responsibilities include:

* Business Validation
* Transactions
* Ownership Checks
* Image Management
* Database Operations
* Domain Logic

No business rule should exist inside controllers.

---

## Models

Models are responsible only for:

* Schema
* Indexes
* Defaults
* Instance Methods
* Static Methods

Models do not contain application business logic.

---

# Folder Philosophy

The project follows a feature-based structure.

```text
src/
│
├── config/
├── constants/
├── middlewares/
├── modules/
├── scripts/
├── types/
└── utils/
```

### config/

Contains third-party and application configuration.

Examples:

* MongoDB
* JWT
* ImageKit
* Multer

---

### constants/

Application-wide constants.

Examples:

* Roles
* Default Images
* Upload Limits

---

### middlewares/

Express middleware.

Examples:

* Authentication
* Authorization
* Validation
* Error Handling

---

### modules/

Each business domain is isolated.

Examples:

```text
auth/

seller/

product/

cart/

wishlist/

order/

review/

dashboard/
```

Each module contains:

* Routes
* Controllers
* Services
* Models
* Validation

---

### scripts/

One-time execution scripts.

Current Example:

* Admin Seed

Future scripts may include:

* Database Seed
* Data Migration

---

### utils/

Reusable utilities shared across modules.

Examples:

* ApiError
* ApiResponse
* AsyncHandler
* JWT Utilities
* Token Utilities
* Image Utilities

---

### types/

Global TypeScript declarations.

Examples:

* Express Request Extension
* Environment Types

---

# Current Foundation

The project foundation is completed.

Completed Modules:

```text
Authentication

Authorization

Seller Module

Image Infrastructure

Admin Seed
```

Infrastructure Completed:

* JWT Authentication
* Refresh Token Rotation
* Google OAuth
* Helmet
* Pino Logger
* Zod Validation
* MongoDB Transactions
* ImageKit Integration
* Multer Configuration
* Centralized Error Handling

These components serve as the foundation for all future modules.

---

# Current Progress

```text
✅ Authentication

✅ Authorization

✅ Seller Module

🚧 Product Module (Next)
```

All completed modules have been:

* Implemented
* Tested
* Reviewed
* Documented
* Merged into the main branch

---

# Project Documentation Strategy

Every major module has its own documentation.

Current Documents:

```text
README.md

PROJECT_ROADMAP.md

AUTH_MODULE.md

AUTHORIZATION.md

ADMIN_SEED.md

SELLER_MODULE.md
```

Upcoming Documents:

```text
PRODUCT_MODULE.md

CART_MODULE.md

ORDER_MODULE.md

REVIEW_MODULE.md

DASHBOARD_MODULE.md
```

The roadmap provides a high-level overview.

Each module document contains detailed business rules, architecture decisions, implementation notes, and API design.

---

# Git Strategy

Development follows a feature-branch workflow.

```text
main
│
├── feature/auth
├── feature/seller
├── feature/product
├── feature/cart
├── feature/order
└── ...
```

Every feature follows this lifecycle:

```text
Create Feature Branch
        ↓
Implementation
        ↓
Testing
        ↓
Documentation
        ↓
Rebase
        ↓
Merge into Main
        ↓
Delete Feature Branch
```

Only completed and tested features are merged into the main branch.



# Foundation Modules

The foundation of KLYRO is completed before moving towards marketplace features.

Current completed modules:

```text
Authentication

Authorization

Seller Module

Admin Seed

Image Infrastructure
```

Every future module depends on this foundation.

---

# Authentication Module

Status

```text
✅ Completed
```

Authentication is designed using JWT Authentication with Refresh Token Rotation.

Implemented Features

* User Registration
* User Login
* Logout
* Refresh Token
* Forgot Password
* Reset Password
* Change Password
* Email Verification
* Resend Verification Email
* Google OAuth Login
* Current User

---

# Authentication Strategy

Access Token

```text
15 Minutes
```

Refresh Token

```text
7 Days
```

Refresh Tokens are:

* Random
* Hashed using SHA256
* Stored inside MongoDB
* Rotated on refresh

Cookies

* httpOnly
* sameSite=strict
* secure (production)

---

# Google OAuth

Implemented

Uses

```text
Authorization Code Flow
```

Business Rules

New Google User

↓

Create Account

Existing Google User

↓

Login

Existing Local Account

↓

Blocked

Reason

Google and Local accounts remain independent to prevent account takeover.

Account linking is intentionally not supported.

---

# Authorization

Status

```text
✅ Completed
```

KLYRO uses Role-Based Authorization.

Current Roles

```text
BUYER

SELLER

ADMIN
```

Implemented

* Generic Authorization Middleware
* Multi Role Support
* Seller Authorization
* Admin Authorization Foundation

Example

```text
authorize(UserRole.SELLER)

authorize(UserRole.BUYER, UserRole.SELLER)
```

Authorization only protects routes.

Business permissions remain inside Services.

Example

Seller can access

```text
PATCH /seller
```

But ownership validation is still handled inside the Seller Service.

---

# Seller Module

Status

```text
✅ Completed
```

Seller module allows a buyer to become a seller.

Business Rules

One User

↓

One Seller

↓

One Store

Relationship

```text
User (1)

↓

Seller (1)

↓

Products (N)
```

Seller becomes active immediately.

No approval flow exists.

No GST

No PAN

No Aadhaar

No Phone Verification

---

# Seller Features

Implemented

* Become Seller
* Seller Profile
* Update Seller Profile
* Update Store Logo
* Update Store Banner

Profile supports

* Store Name
* Business Name
* Description
* Business Address

Updates are partial.

Empty updates are rejected.

---

# Seller Branding

Implemented

Logo

↓

ImageKit Upload

↓

Database Update

↓

Delete Old Image

Banner follows the same flow.

Business Rules

* Default images are never deleted.
* Old images are deleted only after successful upload and successful database update.
* Image cleanup failure never fails the request.

---

# Seller Transactions

Seller creation uses MongoDB Transactions.

Reason

Creating a seller requires updating:

User Collection

↓

Role

AND

Seller Collection

Both operations must succeed together.

---

# Image Infrastructure

Status

```text
✅ Completed
```

Image Storage

```text
ImageKit
```

Upload

```text
Multer
```

Storage Strategy

```text
Memory Storage
```

Current Rules

* Maximum Image Size

```text
5 MB
```

Supported Formats

* JPEG
* PNG
* WebP

Image Structure

```text
url

fileId
```

Current Services

* Upload Image
* Delete Image

Used By

* Seller Logo
* Seller Banner

Future

* Product Images

---

# Validation

Status

```text
✅ Completed
```

Validation Library

```text
Zod
```

Current Schemas

Authentication

Seller

Implemented Features

* Strict Validation
* Partial Update Support
* Nested Object Validation
* Empty Body Rejection

---

# Logging

Status

```text
✅ Completed
```

Logger

```text
Pino
```

Current Usage

* Server Started
* Database Connected
* Unexpected Errors
* Image Cleanup Errors

Future

* Request Logging
* Correlation IDs

---

# Security

Implemented

* Helmet
* Password Hashing
* Refresh Token Hashing
* HTTP Only Cookies
* Secure Cookies
* SameSite Strict
* Email Verification
* Google OAuth
* Role Based Authorization

Security decisions are made before feature implementation.

---

# Admin Seed

Status

```text
✅ Completed
```

Purpose

Create the initial administrator account.

Business Rules

* Admin cannot register publicly.
* Seed creates the first administrator.
* Duplicate admin creation is prevented.
* Uses environment variables.
* Password is hashed before storage.

Future admin management will be handled through the Admin Dashboard.

---

# Current Completed Foundation

```text
Authentication

↓

Authorization

↓

Seller Module

↓

Image Infrastructure

↓

Admin Seed
```

All completed modules are considered production-ready for the current scope and will serve as the base for future marketplace features.


# KLYRO Project Roadmap (Part 3)

# Marketplace Roadmap

With the foundation completed, development now moves towards the core marketplace features.

Every new module will continue following the same development workflow:

```text
Business Discussion
        ↓
Architecture
        ↓
Implementation
        ↓
Testing
        ↓
Documentation
        ↓
Merge
```

---

# Product Module

Status

```text
🚧 Next Priority
```

The Product module is the core of the marketplace.

For this reason, no implementation will begin until the complete business flow and architecture are finalized.

Current Decisions

* Product belongs to a Seller.
* Products reference `sellerId`, not `userId`.
* Product architecture will be finalized before implementation.
* Product images are considered part of the product itself.
* Product creation and product image handling will be designed together.
* Product update will also handle image updates.

Business rules will be frozen before writing the schema.

---

# Buyer Address Module

Status

```text
Planned
```

Current Decision

Buyer addresses will have a dedicated module.

Seller business address and buyer delivery addresses remain independent.

The Address module will be completed before Cart.

---

# Wishlist Module

Status

```text
Planned
```

Business Decision

Wishlist is available for

```text
BUYER

SELLER
```

Sellers can also purchase products.

Wishlist is not restricted to buyers only.

---

# Cart Module

Status

```text
Planned
```

Business Decision

Cart supports

```text
BUYER

SELLER
```

Current Decision

Seller accounts are also customers.

There is no restriction preventing sellers from purchasing products.

---

# Orders

Status

```text
Planned
```

Future Focus

* Order Creation
* Order Lifecycle
* Buyer Order History
* Seller Order Management

Detailed business rules will be finalized before implementation.

---

# Reviews

Status

```text
Planned
```

Future Scope

* Product Reviews
* Product Ratings

Business rules will be finalized after the Order module.

---

# Seller Dashboard

Status

```text
Planned
```

Purpose

Provide sellers with a centralized dashboard to manage their business.

Current Planning

* Store Overview
* Product Management
* Order Management
* Analytics
* Performance Insights

Store branding (logo and banner) remains independent from the dashboard.

---

# Admin Dashboard

Status

```text
Planned
```

Purpose

Provide complete administrative control over the platform.

Current Planning

* User Management
* Seller Management
* Product Management
* Dashboard Analytics

Future administrative actions may include deletion and moderation features.

---

# Delete Strategy

Status

```text
Planned
```

Deletion APIs are intentionally postponed.

Future discussions will determine the appropriate strategy for:

* User Deletion
* Seller Deletion
* Product Deletion

The implementation approach (hard delete, soft delete, or deactivation) will be finalized before development.

---

# Future Development Order

Current roadmap

```text
Authentication
        ↓
Authorization
        ↓
Seller
        ↓
Product
        ↓
Buyer Address
        ↓
Wishlist
        ↓
Cart
        ↓
Orders
        ↓
Reviews
        ↓
Seller Dashboard
        ↓
Admin Dashboard
```

Every module will be completed before moving to the next one.

---

# Business Rule Policy

Every major feature follows the same rule.

No implementation starts until:

* Business Rules
* Database Design
* API Design
* Architecture

have been finalized.

Code is written only after design decisions are complete.

---

# Current Marketplace Status

```text
✅ Marketplace Foundation Completed

↓

🚧 Product Module Begins Next
```

The Product module marks the beginning of the marketplace domain and will become the foundation for all remaining commerce features.


# KLYRO Project Roadmap (Part 4)

# Infrastructure Roadmap

The marketplace foundation will be strengthened with production-focused infrastructure after the core commerce modules are completed.

The implementation order has been intentionally planned to avoid introducing unnecessary complexity during the early stages of development.

---

# Redis

Status

```text
Planned
```

Redis will be introduced only after multiple use cases exist.

Current Decision

Redis will not be added for a single feature.

It should solve multiple problems before becoming part of the architecture.

Potential Uses

* Caching
* Rate Limiting
* Session Management
* OTP / Verification Attempts

---

# Rate Limiting

Status

```text
Planned
```

Current Decision

Rate limiting will be implemented together with Redis.

The goal is to avoid maintaining two different implementations.

---

# Graceful Shutdown

Status

```text
Planned
```

Will be implemented after Redis integration.

Purpose

* Proper database shutdown
* Safe server termination
* Request completion before exit

---

# Testing Strategy

Every completed module must pass:

* Business Rule Testing
* API Testing
* Validation Testing
* Authorization Testing
* Error Handling Testing

No feature is considered complete until every critical path has been tested.

---

# Documentation Strategy

Every completed module receives dedicated documentation.

Current Documents

```text
README.md

PROJECT_ROADMAP.md

AUTH_MODULE.md

AUTHORIZATION.md

ADMIN_SEED.md

SELLER_MODULE.md
```

Upcoming

```text
PRODUCT_MODULE.md

ADDRESS_MODULE.md

WISHLIST_MODULE.md

CART_MODULE.md

ORDER_MODULE.md

REVIEW_MODULE.md

SELLER_DASHBOARD.md

ADMIN_DASHBOARD.md
```

Each document contains

* Business Rules
* Architecture Decisions
* APIs
* Validation
* Design Decisions
* Current Status

---

# Git Workflow

Development follows a feature-branch workflow.

```text
feature/*
        ↓
Implementation
        ↓
Testing
        ↓
Documentation
        ↓
Rebase
        ↓
Merge into Main
        ↓
Delete Feature Branch
```

Only stable and reviewed features are merged into the main branch.

Merged feature branches are deleted.

---

# Code Review Checklist

Before every merge:

* Business Rules Verified
* Validation Reviewed
* Service Logic Reviewed
* Controller Reviewed
* Authorization Reviewed
* Error Handling Reviewed
* Naming Reviewed
* Testing Completed
* Documentation Updated

Only then is the feature merged.

---

# Engineering Standards

The project follows these standards.

* Thin Controllers
* Business Logic inside Services
* Feature-Based Modules
* Generic Reusable Components
* No Duplicate Business Logic
* Secure by Default
* Production-Oriented Decisions
* Business Discussion before Implementation

---

# Long-Term Goal

KLYRO is intended to become a complete production-oriented multi-vendor marketplace backend.

The project focuses on learning real-world backend engineering rather than only building CRUD APIs.

The objective is to understand:

* Software Architecture
* Business-Driven Design
* Security
* Scalability
* Maintainability
* Production Workflows
* Documentation Practices
* Git Workflows

Every completed module should be independently documented, production reviewed, and ready to integrate with future modules.

---

# Overall Development Progress

```text
Phase 1

✅ Authentication

✅ Authorization

✅ Seller Module

────────────────────────────

Phase 2

🚧 Product Module

⏳ Buyer Address

⏳ Wishlist

⏳ Cart

⏳ Orders

⏳ Reviews

────────────────────────────

Phase 3

⏳ Seller Dashboard

⏳ Admin Dashboard

────────────────────────────

Phase 4

⏳ Redis

⏳ Rate Limiting

⏳ Graceful Shutdown
```

---

# Final Objective

Every implementation in KLYRO should prioritize correctness, maintainability, security, and clean architecture over speed.

Features are designed as production systems first and implemented only after the underlying business rules and architecture have been finalized.

The roadmap evolves as new business decisions are made, ensuring that architecture always drives implementation rather than the other way around.
