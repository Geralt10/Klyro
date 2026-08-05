# Klyro Backend

Klyro is a TypeScript backend for a multi-vendor commerce platform. It provides account management, seller onboarding, product catalog management, carts, addresses, payments, orders, seller order management, reviews, and a seller dashboard through a versioned REST API.

The codebase uses a feature-oriented, layered design: routes handle HTTP composition, controllers translate HTTP requests and responses, services own business rules, and Mongoose models own persistence concerns.

## Features

- Account registration, email verification, password recovery, Google sign-in, JWT refresh rotation, and logout
- Role-based access control for buyers, sellers, and administrators
- Seller profile and storefront asset management
- Buyer, seller, and administrator product views with filtering, sorting, and pagination
- Cart and address management
- Cash-on-delivery and Razorpay payment flows
- Transactional order creation, inventory changes, cancellation, and refunds
- Seller order management, product reviews, and seller dashboard reporting
- Centralized validation, error responses, security headers, cookie handling, and structured logging

## Tech stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| HTTP | Express 5 |
| Data | MongoDB and Mongoose |
| Validation | Zod |
| Authentication | JWT, HTTP-only cookies, Google OAuth |
| Payments | Razorpay |
| Media | ImageKit and Multer |
| Email | Nodemailer |
| API documentation | OpenAPI 3, swagger-jsdoc, Swagger UI |
| Logging and security | Pino and Helmet |

## Architecture

```text
HTTP request
  -> route middleware (authentication, authorization, validation)
  -> controller
  -> service
  -> Mongoose model
  -> MongoDB
```

Business rules reside in services. Controllers are intentionally thin and return a consistent `ApiResponse` envelope. Models define persistence shape, indexes, and document-level invariants.

## Folder structure

```text
src/
  config/        Application, database, logging, upload, payment, and cookie configuration
  constants/     Shared roles and static application constants
  middlewares/   Authentication, authorization, validation, and error handling
  modules/       Feature modules: auth, seller, products, cart, address, payment, order, review
  services/      External integrations such as email, images, and Razorpay
  shared/        Cross-module schemas and validation primitives
  types/         Express and domain type declarations
  utils/         API envelopes, errors, async wrapper, JWT, token, slug, and input helpers
  app.ts         Express application and route registration
  server.ts      Database connection and HTTP server startup
docs/
  openapi.yaml   OpenAPI path, request, response, and schema documentation
```

## Installation

```bash
git clone <repository-url>
cd klyro
npm install
cp .env.example .env
```

Populate `.env` before running the service. Never commit this file or real credentials.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port, defaults to `3000` when not set |
| `NODE_ENV` | Runtime environment, for example `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY` | Access-token signing configuration |
| `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY` | Refresh-token signing configuration |
| `FRONTEND_URL` | Allowed browser origin for credentialed CORS requests |
| `SMTP_USER`, `SMTP_CLIENT_ID`, `SMTP_CLIENT_SECRET`, `SMTP_REFRESH_TOKEN` | SMTP OAuth configuration |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google sign-in configuration |
| `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | ImageKit configuration |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay configuration |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin seed configuration |

Use long, cryptographically random JWT secrets and provider credentials in a secret manager for production.

## Running locally

```bash
npm run dev
```

The API is served at `http://localhost:<PORT>/api/v1`. Interactive API documentation is available at `http://localhost:<PORT>/docs`.

## Build and production deployment

```bash
npm run build
npm start
```

For production:

- Set `NODE_ENV=production` and configure a single explicit `FRONTEND_URL`.
- Run MongoDB as a replica set; order, seller, and review workflows use transactions.
- Supply all secrets through the deployment platform rather than source files.
- Terminate TLS at a trusted proxy or load balancer and enable secure cookies.
- Run database index creation/migrations deliberately before serving production traffic.
- Configure log aggregation, uptime checks, backups, and alerting outside this application.

## API overview

All application endpoints are versioned under `/api/v1`.

| Area | Base path |
| --- | --- |
| Authentication | `/auth` |
| Seller profile and dashboard | `/seller`, `/seller/dashboard` |
| Products | `/products`, `/seller/products`, `/admin/products` |
| Cart | `/cart` |
| Addresses | `/addresses` |
| Payments | `/payments` |
| Customer orders | `/orders` |
| Seller OMS | `/seller/orders` |
| Reviews | `/reviews`, `/products/{productId}/reviews` |

See `/docs` for complete request, response, parameter, and error documentation.

## Authentication flow

1. A user registers and verifies their email, or signs in with Google.
2. Login sets short-lived access and longer-lived refresh tokens as HTTP-only cookies.
3. Protected endpoints authenticate the access token and authorize the required role.
4. `POST /api/v1/auth/refresh` rotates the refresh token and issues a new access token.
5. Password changes, resets, and logout invalidate the persisted refresh token.

The browser client uses cookies. For API clients that cannot use cookies, the OpenAPI specification also describes the equivalent `Bearer` JWT security scheme; the deployed middleware currently reads the access token from the `accessToken` cookie.

## Security, validation, and errors

- Helmet sets security-focused HTTP headers.
- CORS is restricted to `FRONTEND_URL` and credentialed requests are enabled.
- Access and refresh cookies are HTTP-only, `SameSite=Strict`, and secure in production.
- Passwords use bcrypt; persisted refresh and verification/reset tokens are hashed.
- Zod validates request bodies, parameters, and queries before services execute.
- Protected routes use JWT authentication and role-based authorization.
- Regular-expression search input is escaped before being used in MongoDB queries.
- Errors are handled centrally. Expected failures return `{ success: false, message }`; unexpected failures are logged and return HTTP 500 without internal details.

## Transactions and data consistency

MongoDB transactions protect seller profile creation, order stock deduction/order creation/cart clearing, order cancellation stock restoration/payment updates, and review/rating updates. Production MongoDB must therefore support transactions through a replica set or sharded cluster.

## Future roadmap

- Automated unit, integration, and contract test coverage
- Rate limiting and abuse protection at the edge
- Health/readiness endpoints and graceful shutdown
- Background reconciliation for external payment and media-provider failures
- Operational metrics, tracing, and alerting
- Cursor pagination for high-volume listings

## License

This project is licensed under the ISC License. See `package.json` for the current license declaration.
