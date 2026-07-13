# Authorization

## Overview

KLYRO uses **Role-Based Authorization (RBAC)** to control access to protected resources.

Authorization is handled after successful authentication.

Flow:

```text
Request
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
```

Authentication identifies the user.

Authorization determines whether the authenticated user is allowed to access a specific route.

---

# User Roles

Implemented Roles:

```text
BUYER
SELLER
ADMIN
```

---

# Authorization Middleware

The project uses a generic authorization middleware.

Example:

```ts
authorize(UserRole.SELLER)
```

or

```ts
authorize(
    UserRole.BUYER,
    UserRole.SELLER
)
```

The middleware accepts one or multiple allowed roles.

If the authenticated user's role is not included, the request is rejected with:

```http
403 Forbidden
```

---

# Responsibilities

Authentication

- Verify JWT
- Identify the user
- Attach user information to the request

Authorization

- Verify allowed roles
- Block unauthorized requests
- Return HTTP 403

Business Logic

- Resource ownership
- Business permissions
- Domain rules

Business permissions are **not** handled inside the authorization middleware.

---

# Current Route Permissions

## Seller Module

### Create Seller

```text
Authenticated Buyer
```

Purpose:

Become a seller.

---

### Get Seller Profile

```text
SELLER
```

---

### Update Seller Profile

```text
SELLER
```

---

### Update Seller Logo

```text
SELLER
```

---

### Update Seller Banner

```text
SELLER
```

---

# Planned Permissions

## Product Module

### Create Product

```text
SELLER
```

---

### Update Product

```text
SELLER
```

Ownership verification will be handled inside the Product Service.

---

### Delete Product

```text
SELLER
```

Ownership verification will be handled inside the Product Service.

---

### Get Products

```text
Public
```

No authorization required.

---

## Cart Module

```text
BUYER
SELLER
```

Sellers are allowed to purchase products.

---

## Wishlist Module

```text
BUYER
SELLER
```

---

## Orders

```text
BUYER
SELLER
```

---

## Admin Module

Planned responsibilities:

- User Management
- Seller Management
- Product Moderation
- Order Management
- Dashboard
- Reports

Admin-specific authorization rules will be implemented inside the Admin module.

---

# Design Principles

- Generic Authorization Middleware
- Role-Based Access Control
- Separation of Authentication & Authorization
- Business Rules Stay Inside Services
- Route-Level Access Control
- Resource Ownership Checked Inside Services

---

# Example

```text
Authenticate
        ↓
Authorize(SELLER)
        ↓
Controller
        ↓
Service

        ↓

Is seller the owner of this resource?

YES → Continue

NO → 403
```

Authorization only controls access to the route.

Business permissions remain inside the service layer.

---

# Current Status

## Completed

- Generic Authorization Middleware
- Seller Authorization
- Multi-role Authorization Support
- Route Protection

---

## Planned

- Product Authorization
- Cart Authorization
- Wishlist Authorization
- Order Authorization
- Admin Authorization Rules