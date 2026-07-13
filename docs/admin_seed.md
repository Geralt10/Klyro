# Admin Seed

## Overview

The Admin Seed is used to create the initial administrator account for KLYRO.

This script is intended to be executed **only once** during project setup.

It ensures that the application always has a privileged administrator account without requiring public registration.

---

# Purpose

- Bootstrap the first administrator.
- Prevent manual database insertion.
- Simplify local and production setup.

---

# Business Rules

- Admin accounts cannot be created through public APIs.
- Only the seed script is responsible for creating the first administrator.
- Running the seed multiple times must not create duplicate admin accounts.
- If an admin already exists, the script exits safely.

---

# Admin Role

```text
Role = ADMIN
```

Admin has elevated privileges over the platform.

---

# Seed Flow

```text
Application
        ↓
Run Seed Script
        ↓
Check Existing Admin
        ↓
Admin Exists?
      ↓         ↓
    Yes         No
     ↓           ↓
 Exit        Create Admin
                  ↓
           Hash Password
                  ↓
            Save to MongoDB
```

---

# Default Admin Information

The initial administrator is created using environment variables.

Example:

```env
ADMIN_NAME=

ADMIN_EMAIL=

ADMIN_PASSWORD=
```

Passwords are hashed before storage.

---

# Security

- Password is hashed using bcrypt.
- Admin credentials are never hardcoded.
- Credentials are loaded from environment variables.
- Duplicate admin creation is prevented.

---

# Usage

Run the seed script:

```bash
npm run seed:admin
```

---

# Folder Structure

```text
src/
└── scripts/
    └── seedAdmin.ts
```

---

# Design Decisions

- Environment-driven configuration.
- Idempotent execution.
- No public admin registration.
- One-time initialization.
- Production-oriented setup.

---

# Current Status

## Completed

- Admin Seed Script
- Duplicate Admin Check
- Environment Variable Support
- Password Hashing
- Role Assignment