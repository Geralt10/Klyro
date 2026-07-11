# Authentication Module

**Status:** ✅ Completed

The Authentication module is responsible for user identity, authentication,
session management and account security.

This module follows a production-oriented layered architecture where
controllers, services, models and utilities have clearly separated
responsibilities.

This document explains the complete authentication architecture,
business rules, security decisions and implementation details.

---

## Goals

- Secure authentication
- Clean architecture
- Production-ready design
- Easy future scalability
- Separation of concerns
- Secure session management

---

## Features

- User Registration
- User Login
- Google OAuth Login
- Email Verification
- Resend Verification Email
- Refresh Token Rotation
- Logout
- Forgot Password
- Reset Password
- Change Password
- Get Current User

---

## Technology Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Language | TypeScript |
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

## Architecture

The project follows a layered architecture.

Client

↓

Express Route

↓

Validation Middleware

↓

Controller

↓

Service

↓

Model / Utility

↓

MongoDB

↓

Response

---

## Layer Responsibilities

### Routes

Responsible for mapping endpoints.

No business logic.

---

### Validation

Responsible for validating incoming requests.

Uses Zod.

Controllers always receive validated data.

---

### Controllers

Controllers only:

- Read Request
- Call Service
- Return Response

Controllers never:

- Query Database
- Generate JWT
- Hash Passwords
- Send Emails

---

### Services

Services contain every business rule.

Examples:

- Registration
- Login
- Google OAuth
- Refresh Token Rotation
- Email Verification
- Forgot Password

Services never depend on Express.

---

### Models

Models contain

- Schema
- Instance Methods

Business workflows never belong inside models.

---

### Utilities

Utilities provide reusable helper functions.

Examples

- JWT Verification
- Token Hashing
- Google OAuth Helper
- Async Handler
- API Response
- API Error

---

## Folder Structure

src/

config/

middlewares/

modules/

utils/

constants/

types/

## Authentication Strategy

KLYRO uses JWT-based authentication.

Two different tokens are generated during login.

1. Access Token
2. Refresh Token

Both tokens have different responsibilities.

---

### Access Token

Purpose

Authenticate every protected request.

Lifetime

15 Minutes

Storage

HttpOnly Cookie

Payload

- User ID
- User Role

Access tokens are intentionally short-lived to reduce the impact of token theft.

---

### Refresh Token

Purpose

Generate new access tokens without requiring the user to login again.

Lifetime

7 Days

Storage

HttpOnly Cookie

Database

SHA256 Hash

Raw refresh tokens are NEVER stored inside MongoDB.

---

## Cookie Strategy

Access Token Cookie

- HttpOnly
- SameSite: Strict
- Secure (Production)
- Max Age: 15 Minutes

Refresh Token Cookie

- HttpOnly
- SameSite: Strict
- Secure (Production)
- Max Age: 7 Days

Reason

- Prevent XSS attacks
- Reduce CSRF risk
- Prevent JavaScript access to tokens

---

## Registration Flow

Client

↓

POST /api/v1/auth/register

↓

Validation Middleware

↓

Controller

↓

Service

↓

Find Existing User

↓

Business Rules

---

### Case 1

Email does NOT exist

↓

Create User

↓

Generate Email Verification Token

↓

Hash Verification Token

↓

Store Hash

↓

Send Verification Email

↓

Registration Successful

---

### Case 2

Verified Local User Exists

↓

409 Conflict

↓

Email already registered.

---

### Case 3

Google Account Exists

↓

409 Conflict

↓

Email already registered.

Reason

Google accounts are intentionally NOT converted into Local accounts.

---

### Case 4

Local Account Exists but Email Not Verified

↓

Generate New Verification Token

↓

Replace Old Token

↓

Send Verification Email Again

Existing account is reused.

Duplicate accounts are never created.

---

## Login Flow

Client

↓

POST /api/v1/auth/login

↓

Validation

↓

Find User

↓

User Exists?

↓

Email Verified?

↓

Compare Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Hash Refresh Token

↓

Store Hash in Database

↓

Set Cookies

↓

Login Successful

---

## Refresh Token Flow

Client

↓

POST /api/v1/auth/refresh

↓

Read Refresh Token Cookie

↓

Verify JWT

↓

Hash Incoming Refresh Token

↓

Find User

↓

Compare Stored Hash

↓

Generate New Access Token

↓

Generate New Refresh Token

↓

Replace Stored Refresh Token Hash

↓

Update Cookies

↓

Return Success

This implements Refresh Token Rotation.

Old refresh tokens immediately become invalid.

---

## Logout Flow

Client

↓

POST /api/v1/auth/logout

↓

Read Refresh Token Cookie

↓

Hash Token

↓

Find User

↓

Remove Stored Refresh Token Hash

↓

Clear Cookies

↓

Logout Successful

---

## Business Rules

Registration

- Email must be unique.
- Email verification is mandatory.
- Existing verified local users cannot register again.
- Existing Google users cannot register locally.

Login

- Email must be verified.
- Password must match.
- Refresh token is rotated on every login.

Refresh

- Incoming refresh token must match stored hash.
- Old refresh token becomes invalid immediately.

Logout

- Stored refresh token hash is removed.
- Authentication cookies are cleared.

---

## Design Decisions

Access Token

- Short lifetime
- Sent automatically using HttpOnly cookies

Refresh Token

- Long lifetime
- Stored as SHA256 hash
- Rotated on every successful refresh

Reason

If the database is compromised, attackers cannot directly use stored refresh tokens because only their hashes are stored.

## Google OAuth

KLYRO supports Google authentication using Google's **Authorization Code Flow**.

The frontend never sends Google user information directly to the backend.

Instead, it sends a short-lived authorization code.

This makes the authentication process significantly more secure than trusting
client-side user information.

---

## OAuth Flow

Frontend

↓

Google Login Popup

↓

User Selects Google Account

↓

Google Returns Authorization Code

↓

Frontend Sends Code To Backend

↓

Backend Exchanges Code With Google

↓

Google Returns ID Token

↓

Backend Verifies ID Token

↓

Extract Google Profile

↓

Business Logic

↓

Generate JWT Tokens

↓

Login Successful

---

## Frontend

The frontend uses Google's OAuth Code Client.

Flow

User clicks

"Continue with Google"

↓

Google popup opens

↓

User selects account

↓

Frontend receives

Authorization Code

↓

Authorization Code is sent to backend

The frontend never verifies the user.

The backend is the source of truth.

---

## Backend

Backend uses

google-auth-library

Flow

Receive Authorization Code

↓

Exchange Code

↓

Receive Tokens

↓

Verify ID Token

↓

Extract Google Profile

↓

Execute Business Rules

Only verified Google profiles are accepted.

---

## Google Profile

The backend extracts

- Google ID
- Email
- Name
- Avatar
- Email Verified

Only trusted information coming directly from Google is used.

---

## Google Login Business Rules

### Case 1

Existing Google User

↓

Login

↓

Generate JWT

↓

Update Refresh Token

↓

Success

---

### Case 2

New Google User

↓

Create User

↓

Generate JWT

↓

Success

---

### Case 3

Existing Local User

↓

Reject Login

↓

409 Conflict

Reason

Google and Local accounts are intentionally NOT linked.

---

## Why Accounts Are Not Linked

This decision was made intentionally.

Example

Victim

john@gmail.com

↓

Creates Google Account

↓

Attacker Knows Email

↓

Attacker Registers Local Password

↓

Attacker Gets Full Account Access

This is called an account takeover.

To eliminate this risk

KLYRO completely separates

Local Accounts

and

Google Accounts.

An email can belong to only one authentication provider.

---

## Email Verification

Local Users

↓

Must Verify Email

↓

Can Login

Google Users

↓

Already Verified By Google

↓

No Email Verification Required

Reason

Google already guarantees email ownership.

---

## Avatar Strategy

Local Users

↓

Default Avatar

Google Users

↓

Google Profile Picture

This provides a better user experience while keeping registration simple.

---

## Why Authorization Code Flow?

Authorization Code Flow was chosen because

- Backend performs verification.
- Client never receives sensitive tokens.
- Google identity is verified server-side.
- Recommended by Google for modern web applications.

This approach is significantly more secure than trusting frontend identity data.

---

## Security Decisions

Google email must be verified.

Google profile must contain

- Google ID
- Email

Otherwise authentication is rejected.

Only Google's verified identity information is trusted.

---

## Business Rules Summary

Existing Google User

↓

Login

New Google User

↓

Create Account

Existing Local User

↓

Reject

Google Accounts

≠

Local Accounts

No Account Linking

Email Verification

Required For Local Users

Already Verified For Google Users

---

## Design Philosophy

Security is preferred over convenience.

Although account linking could improve user experience,
it also introduces additional attack vectors.

The project intentionally prioritizes account safety over account merging.

This decision keeps authentication simpler, easier to audit,
and resistant to common account takeover attacks.


# Email Verification

Email verification is mandatory for every local account.

A newly registered user cannot login until the email address has been verified.

This prevents:

- Fake accounts
- Invalid email addresses
- Unauthorized registrations

Google users are exempt from this process because Google already verifies email ownership.

---

## Email Verification Flow

User Registers

↓

Generate Verification Token

↓

SHA256 Hash

↓

Store Hash

↓

Send Verification Email

↓

User Clicks Verification Link

↓

Verify Token

↓

Mark User Verified

↓

Delete Verification Token

↓

Verification Successful

---

## Business Rules

### Verified User

Can Login

---

### Unverified User

Cannot Login

---

### Verification Token

Random

↓

SHA256 Hash

↓

Stored in Database

↓

Expires Automatically

Raw verification tokens are never stored inside MongoDB.

---

## Resend Verification Email

If a user has not verified their email, they can request another verification email.

Flow

User Requests Verification Again

↓

Generate New Verification Token

↓

Replace Previous Token

↓

Store New Hash

↓

Send Verification Email

The old verification token immediately becomes invalid.

---

# Forgot Password

Forgot Password allows users to securely reset their password.

---

## Forgot Password Flow

User Enters Email

↓

Generate Reset Token

↓

SHA256 Hash

↓

Store Hash

↓

Send Password Reset Email

---

## Reset Password Flow

User Opens Link

↓

Token Received

↓

SHA256 Hash

↓

Find User

↓

Validate Token

↓

Hash New Password

↓

Remove Reset Token

↓

Password Updated

---

## Password Reset Rules

Reset token must exist.

Reset token must not be expired.

Reset token must match stored hash.

After successful reset:

- Password is updated.
- Reset token is deleted.
- Reset expiry is deleted.

A reset token can only be used once.

---

# User Model

The User model is the core entity of the authentication module.

Authentication, email verification, Google OAuth and password reset all depend on this model.

---

## User Fields

### name

Stores the user's display name.

Required.

Trimmed before saving.

---

### email

Unique identifier of the user.

Properties

- Unique
- Lowercase
- Trimmed

---

### password

Stores bcrypt hashed password.

Only required for Local accounts.

Google accounts do not require passwords.

Password is hidden by default.

select: false

---

### googleId

Stores the unique Google account identifier.

Properties

- Optional
- Unique
- Sparse Index

Only Google users contain this field.

---

### avatar

Stores the user's profile image.

Local Users

↓

Default Avatar

Google Users

↓

Google Profile Picture

---

### role

Current implementation

USER

Future

Seller authorization will extend this.

---

### isVerified

Represents email verification.

This field DOES NOT represent seller verification.

---

### refreshToken

Stores SHA256 hash of refresh token.

Raw refresh tokens are never stored.

Hidden from normal queries.

---

### verificationToken

Stores hashed email verification token.

Temporary field.

Deleted after successful verification.

---

### verificationTokenExpiry

Expiry timestamp for verification token.

---

### passwordResetToken

Stores hashed password reset token.

Temporary field.

---

### passwordResetTokenExpiry

Expiry timestamp for reset password token.

---

# Model Methods

## comparePassword()

Compares plaintext password with bcrypt hash.

Returns

Promise<boolean>

---

## generateAccessToken()

Generates Access Token.

Payload

- User ID
- User Role

---

## generateRefreshToken()

Generates Refresh Token.

Payload

- User ID

---

# Password Hashing

Passwords are automatically hashed using bcrypt.

Flow

User Saves Password

↓

Pre Save Hook

↓

Password Modified?

↓

Yes

↓

bcrypt.hash()

↓

Store Hash

Services never manually hash passwords.

The model is responsible for password hashing.

---

# Refresh Token Hashing

Refresh Tokens are never stored directly.

Flow

Generate Refresh Token

↓

SHA256 Hash

↓

Store Hash

↓

Return Raw Token To Client

During Refresh

Incoming Token

↓

SHA256 Hash

↓

Compare With Stored Hash

↓

Generate New Tokens

This approach reduces risk if the database is compromised.

---

# Validation

Validation is performed using Zod.

Validation occurs before controllers execute.

Controllers always receive validated data.

---

## Implemented Schemas

- Register
- Login
- Google Login
- Forgot Password
- Reset Password
- Change Password
- Resend Verification

---

## Password Rules

Password must contain

- One Uppercase Letter
- One Lowercase Letter
- One Number
- One Special Character

Minimum Length

8 Characters

Maximum Length

100 Characters

---

## Email Rules

Email is automatically

- Trimmed
- Converted to Lowercase

---

## Validation Flow

Client

↓

Validation Middleware

↓

Zod Validation

↓

Success

↓

Controller

Invalid requests never reach services.

---

# Authentication Middleware

The authenticate middleware protects all private routes.

Flow

Request

↓

Read Access Token Cookie

↓

Verify JWT

↓

Extract User Payload

↓

Attach req.user

↓

Continue

Current Protected Routes

- GET /me
- PATCH /change-password

Future seller routes will also use this middleware.

---

# Error Handling

Authentication uses centralized error handling.

Business Errors

↓

ApiError

↓

Client Response

Unexpected Errors

↓

Pino Logger

↓

500 Internal Server Error

Controllers never contain repetitive try/catch blocks because every controller is wrapped by AsyncHandler.

# Utilities

The Authentication module contains several reusable utilities.

Utilities are completely independent from business logic and can be reused across the entire application.

---

## ApiError

Purpose

Provide a standardized application error.

Responsibilities

- HTTP Status Code
- Error Message

Business logic throws ApiError instead of manually creating responses.

Example

Authentication Failed

↓

throw ApiError

↓

Error Middleware

↓

Response

---

## ApiResponse

Purpose

Provide a consistent success response structure.

Structure

- Status Code
- Message
- Data

Every successful controller returns ApiResponse.

---

## AsyncHandler

Purpose

Remove repetitive try/catch blocks.

Every asynchronous controller is wrapped inside AsyncHandler.

Flow

Controller

↓

Promise

↓

Success

↓

Response

↓

Failure

↓

Error Middleware

---

## JWT Utilities

Responsibilities

- Verify Access Token
- Verify Refresh Token

JWT generation is intentionally NOT performed here.

Token generation belongs to the User model.

---

## Token Utilities

Responsibilities

Generate

- Verification Token
- Password Reset Token

Hash Tokens

↓

SHA256

Return

- Raw Token
- Hashed Token
- Expiry

---

## Google Utilities

Responsibilities

- Exchange Authorization Code
- Verify Google ID Token
- Return normalized Google profile

Business logic never exists inside Google utility.

Only Google communication happens here.

---

# Security

Authentication security was prioritized throughout the implementation.

---

## Password Hashing

Algorithm

bcrypt

Passwords are never stored in plaintext.

Hashing occurs automatically using a Mongoose pre-save hook.

---

## Refresh Token Hashing

Refresh Tokens are hashed before being stored.

Algorithm

SHA256

Database stores only hashes.

If the database is compromised, attackers cannot directly reuse refresh tokens.

---

## JWT

Authentication uses

Access Token

↓

15 Minutes

Refresh Token

↓

7 Days

Refresh Token Rotation is implemented.

---

## Cookies

Cookies

- HttpOnly
- SameSite Strict
- Secure (Production)

JavaScript cannot access authentication cookies.

---

## Helmet

Helmet is enabled globally.

Purpose

Automatically set secure HTTP headers.

Benefits

- Better browser security
- Reduced attack surface
- Secure defaults

---

## Logging

Logging uses

Pino

Current Usage

- Server Started
- Database Connected
- Unexpected Errors

Future Improvements

- HTTP Request Logging
- Correlation IDs
- Request IDs

---

# API Endpoints

## Register

POST

/api/v1/auth/register

Authentication

No

Validation

Register Schema

---

## Login

POST

/api/v1/auth/login

Authentication

No

Validation

Login Schema

---

## Google Login

POST

/ api/v1/auth/google

Authentication

No

Validation

Google Login Schema

---

## Refresh

POST

/api/v1/auth/refresh

Authentication

Refresh Cookie

---

## Logout

POST

/api/v1/auth/logout

Authentication

Refresh Cookie

---

## Verify Email

GET

/api/v1/auth/verify-email

Authentication

No

---

## Resend Verification

POST

/api/v1/auth/resend-verification

Authentication

No

---

## Forgot Password

POST

/api/v1/auth/forgot-password

Authentication

No

---

## Reset Password

POST

/api/v1/auth/reset-password

Authentication

No

---

## Change Password

PATCH

/api/v1/auth/change-password

Authentication

Access Token

---

## Current User

GET

/api/v1/auth/me

Authentication

Access Token

---

# Business Rules Summary

User Registration

- Email must be unique.
- Email verification required.
- Existing verified local users cannot register again.
- Existing Google users cannot register locally.

Login

- User must exist.
- Email must be verified.
- Password must match.

Google OAuth

- Google email must be verified.
- Existing Google users login.
- New Google users are created automatically.
- Existing Local users cannot login using Google.
- Google and Local accounts are intentionally NOT linked.

Refresh Token

- Stored as SHA256 hash.
- Rotated after every refresh.
- Only one active refresh token exists.

Logout

- Stored refresh token hash is removed.
- Cookies are cleared.

Password Reset

- Reset tokens expire.
- Reset tokens are hashed.
- One-time use only.

---

# Design Decisions

Controllers

↓

HTTP Only

Services

↓

Business Logic

Models

↓

Database Logic

Utilities

↓

Reusable Helpers

Middleware

↓

Cross-Cutting Concerns

This separation keeps every layer focused on a single responsibility.

---

# Code Review Decisions

During implementation several architectural decisions were intentionally made.

✓ Google and Local accounts are not linked.

Reason

Prevent account takeover attacks.

---

✓ Refresh Tokens are hashed.

Reason

Reduce impact of database compromise.

---

✓ Controllers contain no business logic.

Reason

Maintain separation of concerns.

---

✓ Password hashing occurs in the model.

Reason

Prevent duplicate hashing logic.

---

✓ Validation occurs before controllers.

Reason

Services always receive valid input.

---

✓ JWT verification centralized.

Reason

Avoid duplicated authentication logic.

---

✓ Helmet enabled.

Reason

Secure HTTP headers.

---

✓ Pino used instead of console logging.

Reason

Structured logging.

Production ready.

---

# Future Improvements

Infrastructure

- Redis
- Redis Rate Limiter
- Pino HTTP
- Graceful Shutdown
- Request Correlation IDs

Marketplace

- Authorization
- Seller Module
- Product Module
- Cart
- Wishlist
- Orders
- Reviews

Performance

- Product Caching
- Redis Session Cache

---

# Interview Notes

Why JWT?

Stateless authentication.

Easy horizontal scaling.

---

Why Refresh Token?

Short-lived access tokens improve security while maintaining user experience.

---

Why Refresh Tokens are hashed?

Database compromise should not expose active sessions.

---

Why Google Authorization Code Flow?

Backend verifies Google identity.

Client is never trusted.

---

Why Google and Local accounts are not linked?

Prevent account takeover.

Security over convenience.

---

Why Controllers are thin?

Controllers should only handle HTTP.

Business logic belongs to Services.

---

Why Zod?

Type-safe runtime validation.

Single source of truth for request validation.

---

Why Helmet?

Secure default HTTP headers.

---

Why Pino?

Fast structured logging suitable for production.

---

# Module Status

Authentication Module

Status

✅ Production Ready

Completed

✓ Register

✓ Login

✓ Google OAuth

✓ Email Verification

✓ Forgot Password

✓ Reset Password

✓ Refresh Token Rotation

✓ Logout

✓ Get Current User

✓ Helmet

✓ Pino Logger

✓ Centralized Error Handling

✓ Security Review

✓ Code Review

---

# Next Module

Seller Module

Business Rules

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

Implementation