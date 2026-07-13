# SELLER_MODULE.md

# Seller Module

## Overview

The Seller module enables an authenticated buyer to create and manage an online store within KLYRO.

A seller profile represents a business entity and is linked to exactly one user account.

Once a seller profile is created, the user's role is upgraded from **BUYER** to **SELLER**, allowing access to seller-only features.

This module is fully implemented and serves as the foundation for the upcoming Product module.

---

# Objectives

The Seller module is responsible for:

* Seller Registration
* Seller Profile Management
* Store Branding
* Role Upgrade
* Store Information Management

The module intentionally does **not** manage products, analytics, or orders. Those responsibilities belong to future modules.

---

# Architecture

The Seller module follows the project's layered architecture.

```text
Client
    ↓
Seller Routes
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

Responsibilities

Routes

* Register endpoints.

Authentication

* Verify JWT.
* Attach authenticated user.

Authorization

* Verify allowed roles.

Validation

* Validate request payloads.

Controller

* Receive request.
* Extract data.
* Call service.
* Return response.

Service

Contains all business logic.

Model

Responsible for schema, defaults, indexes and instance methods.

---

# Business Rules

## One User → One Seller

Every authenticated user can own only one seller profile.

Relationship

```text
User (1)
    ↓
Seller (1)
```

Attempting to create another seller profile is rejected.

---

## Store Ownership

Every seller profile belongs to exactly one user.

```text
Seller.userId
```

is immutable after creation.

---

## Seller Registration

Seller registration requires:

* Authenticated user
* Buyer role
* Unique store name

When seller creation succeeds:

1. Seller document is created.
2. User role becomes SELLER.

Both operations are executed inside a MongoDB transaction.

---

## Seller Activation

Current implementation

Seller becomes active immediately.

No approval process exists.

No admin verification.

No KYC.

No GST verification.

No PAN verification.

No Aadhaar verification.

No phone verification.

---

# Seller Schema

Seller

```text
Seller
│
├── userId
├── storeName
├── businessName
├── description
├── businessAddress
│     ├── addressLine1
│     ├── addressLine2
│     ├── city
│     ├── state
│     ├── country
│     └── postalCode
├── logo
├── banner
├── isActive
├── createdAt
└── updatedAt
```

---

# Store Branding

Every seller has:

* Logo
* Banner

Both are stored using ImageKit.

Image structure

```ts
{
    url: string;
    fileId: string;
}
```

Default images are assigned automatically during seller creation.

---

# Image Management

Image upload uses:

* Multer
* Memory Storage
* ImageKit

Flow

```text
Request
      ↓
Multer
      ↓
Memory Buffer
      ↓
ImageKit Upload
      ↓
MongoDB Update
      ↓
Delete Previous Image
```

---

# Image Update Strategy

Current implementation

Upload New Image

↓

Update Database

↓

Delete Previous Image

Reason

If upload fails,

↓

database remains unchanged.

If database update fails,

↓

old image remains active.

If old image deletion fails,

↓

database still remains consistent.

Only storage cleanup is affected.

---

# Default Image Protection

Every seller initially receives default images.

Business Rule

Default images are never deleted.

Deletion happens only when the previous image is not the system default.

---

# Seller Profile

Implemented endpoint

```http
GET /seller
```

Returns

* Store Name
* Business Name
* Description
* Business Address
* Logo
* Banner

The endpoint intentionally returns store information only.

Personal user information is not populated.

---

# Seller Profile Update

Implemented endpoint

```http
PATCH /seller
```

Supports partial updates.

Current supported fields

* Store Name
* Business Name
* Description
* Business Address

Validation rejects:

* Empty request body
* Invalid nested address data

Store name uniqueness is checked only when the store name changes.

---

# Logo Update

Endpoint

```http
PATCH /seller/logo
```

Flow

```text
Authenticate
      ↓
Authorize
      ↓
Receive Image
      ↓
Upload ImageKit
      ↓
Update Seller
      ↓
Delete Previous Image
```

Image cleanup never causes the API request to fail.

---

# Banner Update

Endpoint

```http
PATCH /seller/banner
```

Uses the same strategy as logo upload.

---

# Validation

Validation library

```text
Zod
```

Implemented Schemas

* Create Seller
* Update Seller

Validation Features

* Strict validation
* Nested validation
* Partial updates
* Empty body rejection

---

# Authorization

Implemented using generic role-based middleware.

Protected routes

```text
GET /seller

PATCH /seller

PATCH /seller/logo

PATCH /seller/banner
```

Allowed role

```text
SELLER
```

Seller creation is available to authenticated buyers.

Authorization only controls route access.

Business ownership checks remain inside services.

---

# Transactions

MongoDB transactions are used during seller creation.

Reason

Creating a seller affects two collections.

```text
User

↓

Seller
```

Without transactions,

one operation could succeed while the other fails.

Transactions ensure both operations complete successfully or both are rolled back.

---

# Error Handling

All services throw ApiError.

Controllers never perform business validation.

Unexpected failures are handled by the centralized error middleware.

---

# Logging

Current logging includes

* Unexpected errors
* Image cleanup failures

Image cleanup failure does not fail the request because business data has already been updated successfully.

---

# APIs

## Become Seller

```http
POST /seller
```

Creates a seller profile.

---

## Get Seller Profile

```http
GET /seller
```

Returns seller information.

---

## Update Seller

```http
PATCH /seller
```

Updates seller information.

---

## Update Logo

```http
PATCH /seller/logo
```

Updates seller logo.

---

## Update Banner

```http
PATCH /seller/banner
```

Updates seller banner.

---

# Current Status

## Completed

* Seller Registration
* Seller Profile
* Seller Update
* Logo Upload
* Banner Upload
* MongoDB Transactions
* ImageKit Integration
* Image Cleanup
* Role Upgrade
* Authorization
* Validation
* Error Handling

---

# Future Scope

The following features intentionally belong to future modules and are **not** part of the current Seller module.

* Product Management
* Seller Dashboard
* Analytics
* Orders
* Reviews
* Store Performance
* Administrative Management

The Seller module is considered complete for the current project phase and serves as the foundation for the Product module.
