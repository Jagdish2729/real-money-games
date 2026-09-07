# Real Money Games

A mobile-first web platform foundation for prediction games.

## Important

This repository is a software foundation. It does not include payment-provider credentials, real-money settlement credentials, or any mechanism for manipulating game outcomes.

## Planned modules

- Mobile OTP authentication
- User wallet with double-entry-style transaction ledger
- Deposit request workflow (manual verification ready)
- Withdrawal request workflow
- Dice prediction game
- Coin toss prediction game
- Admin dashboard
- Audit logging
- Rate limiting and idempotency
- Server-authoritative game settlement

## Architecture

- `apps/web` — Next.js user-facing application
- `apps/api` — NestJS API/application services
- `apps/admin` — Next.js admin console
- `packages/shared` — shared types/constants
- `database` — SQL schema and migrations

## Development

The initial commit establishes the repository structure and design contracts. Payment integration and production credentials must be configured separately.
