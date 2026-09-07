# Architecture

## Core principle

The client never decides wallet balances, game results, payouts, or transaction status. The API is authoritative.

## Money flow

1. User submits a deposit request with amount, UTR/reference, and optional proof.
2. Request enters `PENDING`.
3. Admin verifies the payment externally and approves/rejects it.
4. Approval creates an immutable wallet ledger credit exactly once.
5. A game entry reserves/stakes funds through a server-side ledger transaction.
6. Game settlement creates the corresponding debit/payout ledger entries atomically.
7. Withdrawal requests are created against available balance and move through explicit states.

## Game flow

`OPEN -> LOCKED -> RESOLVED`

A prediction is accepted only while the round is open. Once locked, the server generates the outcome using a cryptographically secure random source. The result and settlement are persisted before the client receives the result.

For production, the outcome service should expose an auditable commitment/reveal mechanism where appropriate. No admin UI should be able to arbitrarily alter a resolved outcome.

## Wallet model

Use integer minor units (paise) rather than floating-point money. Every balance change has a ledger entry with:

- unique transaction/idempotency key
- user ID
- amount in paise
- debit/credit direction
- reason/type
- reference entity
- created timestamp

Balance is derived/maintained from ledger entries and reconciled periodically.

## Security boundaries

- OTP endpoints are rate limited.
- Deposit and withdrawal mutations are idempotent.
- Admin actions require separate authorization.
- File uploads are validated and stored outside the application server.
- Secrets never enter Git.
- All financial mutations are audited.
- Game settlement runs server-side in a database transaction.
