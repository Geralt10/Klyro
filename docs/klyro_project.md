# KLYRO

Production-Oriented Multi Vendor Marketplace Backend

---

# Current Status

Project Phase

✅ Authentication Completed
✅ Security Hardening Completed
⏳ Seller Module Planning

---

# Tech Stack

Language
- TypeScript

Runtime
- Node.js

Framework
- Express.js

Database
- MongoDB
- Mongoose

Validation
- Zod

Authentication
- JWT
- Refresh Token Rotation
- Google OAuth Authorization Code Flow

Password Hashing
- bcrypt

Email
- Nodemailer (SMTP)

Logging
- Pino

Security
- Helmet

Future

- ImageKit
- Redis

---

# Architecture

Controller

↓

Service

↓

Model

Supporting Layers

Config

Middlewares

Utils

Constants

Types

Business logic NEVER exists inside controllers.

Controllers only

- receive request
- call service
- return response

Services contain all business rules.

Models contain

- schema
- instance methods

---

# Folder Philosophy

config/

Application configuration

middlewares/

Express middleware

modules/

Feature based modules

utils/

Reusable helpers

constants/

Enums & constants

types/

Global typings

---

# Auth Module

Completed

Features

- Register
- Login
- Google OAuth
- Logout
- Refresh Token
- Email Verification
- Resend Verification
- Forgot Password
- Reset Password
- Change Password
- Get Current User

---

# JWT Strategy

Access Token

15 minutes

Refresh Token

7 days

Refresh Token

Stored as SHA256 hash inside MongoDB.

Cookies

httpOnly

secure (production)

sameSite=strict

---

# Google OAuth

Uses

Authorization Code Flow

Frontend

google.accounts.oauth2.initCodeClient()

Backend

google-auth-library

Flow

Frontend

↓

Authorization Code

↓

Backend

↓

Google Token Exchange

↓

verifyIdToken()

↓

Profile

Business Rules

Google email must be verified.

New email

↓

Create account

Existing Google account

↓

Login

Existing Local account

↓

Blocked

Important Decision

Google Account

≠

Local Account

Account linking intentionally removed.

Reason

Prevent account takeover.

---

# Register Business Rules

New Email

↓

Create account

Existing Local Verified User

↓

409

Existing Google User

↓

409

Existing Local Unverified

↓

Update verification token

↓

Resend verification email

---

# Login

Local login only

Requires

Verified Email

Correct Password

Generates

Access Token

Refresh Token

Stores

Hashed Refresh Token

---

# User Model

Fields

name

email

password

googleId

avatar

role

isVerified

refreshToken

verificationToken

verificationTokenExpiry

passwordResetToken

passwordResetTokenExpiry

Methods

comparePassword()

generateAccessToken()

generateRefreshToken()

---

# Validation

Zod

Schemas

Register

Login

Google Login

Forgot Password

Reset Password

Change Password

Resend Verification

---

# Middlewares

validate()

authenticate()

errorMiddleware()

Authorization middleware intentionally postponed.

Reason

Need seller business rules first.

---

# Utils

ApiError

ApiResponse

AsyncHandler

JWT Utils

Token Utils

Google Utils

---

# Security

Helmet

Completed

Password Hashing

bcrypt

Refresh Token Hashing

SHA256

Email Verification

Implemented

HTTP Only Cookies

Implemented

SameSite Strict

Implemented

Secure Cookies

Production only

---

# Logger

Pino

Completed

Current Usage

Server Started

Database Connected

Unexpected Errors

Future

Pino HTTP

Request Logging

Correlation IDs

---

# Error Handling

Centralized

ApiError

↓

Client Error

Unknown Error

↓

500

↓

Logged

---

# Infrastructure Decisions

Helmet

Implemented

Logger

Implemented

Redis

Postponed

Reason

Only one use case currently.

Rate Limiter

Postponed

Will use Redis Store later.

Graceful Shutdown

Postponed

Will implement after Redis.

---

# Seller Module

Planning Completed

Implementation Not Started

Business Rules

One User

↓

One Seller Profile

↓

One Store

Separate Collection

Seller references User

Relationship

User (1)

↓

Seller (1)

↓

Products (N)

Verification

Email Verified User

Store Information

No GST

No PAN

No Aadhaar

No Phone Verification

No Admin Approval

Seller becomes active immediately after profile creation.

Seller Fields

userId

storeName

businessName

description

address

logo

banner

Future

socialLinks

rating

joinedSince

---

# Product Module

Not Started

Will reference

sellerId

NOT userId

---

# Authorization

Not Implemented

Reason

Seller business rules finalized first.

Future

authenticate()

↓

requireSeller()

---

# Redis Plan

Will be introduced after

Products

Orders

Caching

Multiple use cases

Possible Uses

Rate Limiter

Caching

Sessions

Verification Attempts

---

# Git Workflow

feature/auth

Completed

Next

feature/seller

Future

feature/product

feature/redis

---

# Coding Principles

Business Rules First

↓

Database Design

↓

API Design

↓

Validation

↓

Services

↓

Controllers

↓

Testing

↓

Review

↓

Push

No implementation starts before business rules are frozen.

---

# Current Roadmap

✅ Authentication

✅ Google OAuth

✅ Helmet

✅ Pino Logger

⬜ Seller Module

⬜ Product Module

⬜ Cart

⬜ Wishlist

⬜ Orders

⬜ Reviews

⬜ Redis

⬜ Rate Limiter

⬜ Caching

⬜ Graceful Shutdown

---

# Review Status

Authentication Module

Production Review Passed

Reviewed

✅ Architecture

✅ Security

✅ Validation

✅ Controllers

✅ Services

✅ Models

✅ Routes

✅ Google OAuth

✅ Error Handling

✅ Helmet

✅ Pino Logger