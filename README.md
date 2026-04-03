# 🔐 Full Authorization — Complete Auth System

Production-ready **authentication and authorization system** built in an **Nx monorepo** with NestJS. Includes login by credentials and OAuth2, email verification, two-factor authentication (2FA), password recovery, and secure JWT token management.

A comprehensive solution demonstrating modern security best practices for user authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-99%25-3178c6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-Backend-ea2845?logo=nestjs&logoColor=white)
![Nx](https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Features

- 📧 **Credentials + OAuth2 login** — support for email/password and social authentication (Google, GitHub, etc.)
- ✅ **Email verification** — secure account activation via confirmation link
- 🔐 **Two-Factor Authentication (2FA)** — TOTP via authenticator apps (Google Authenticator, Authy, etc.)
- 🔄 **Password recovery** — full forgot/reset password flow with time-limited tokens
- 🛡️ **JWT Authentication** — access + refresh token strategy with secure HTTP-only cookies
- 👤 **User management** — registration, profile, role-based access control
- 📧 **Email service** — ready-to-use templates for verification, reset, and notifications
- 🏗️ **Nx monorepo** — shared libraries, strict TypeScript configuration, and efficient caching

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Monorepo         | Nx                                  |
| Backend          | NestJS + TypeScript                 |
| ORM              | Prisma                              |
| Database         | PostgreSQL                          |
| Authentication   | Passport.js + JWT + OAuth2          |
| 2FA              | otplib + qrcode                     |
| Email            | Nodemailer (or any SMTP provider)   |
| Validation       | class-validator + class-transformer |
| Containerization | Docker + Docker Compose             |

---

## 🏗️ Architecture

The project is organized as a clean **Nx monorepo**:

```
full-authorization/
├── apps/
│   ├── manual-auth/          # Manual implementation
│   └── passport-auth/        # Passport.js implementation
└── libs/
    └── common/               # Shared utilities, DTOs, guards, decorators
```

**Core security flows:**

- Registration → Email verification → Login (with optional 2FA)
- Forgot password → Reset token → New password
- OAuth callback → Account linking or creation

All sensitive operations are protected with rate limiting, input validation, and proper error handling.

---
