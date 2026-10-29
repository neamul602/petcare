# Dummy Integration Services

**Training-only** stand-ins for five external systems PetCare would use in production. The contracts here are our own design for the training build. They are **not** the real bKash, Nagad, SSLCommerz, MFS or SMS interfaces, and nothing here claims to match them.

Run: `npm run dev -w @petcare/dummy-services` (port 4100, or `DUMMY_PORT`). State is in memory; a restart or reset starts clean.

## APIs

| Service         | Endpoints                                                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payment gateway | `POST /api/payments/authorizations` (method `bkash` \| `nagad` \| `card`, amount in poisha, bookingRef) · `POST /api/payments/authorizations/:id/capture` · `.../:id/release` · `POST /api/payments/:paymentId/refunds` · `GET /api/payments/:paymentId` |
| MFS payout      | `POST /api/payouts/batches` · `POST /api/payouts/:payoutId/freeze` · `.../:payoutId/release` · `GET /api/payouts/:payoutId`                                                                                                                              |
| SMS / OTP       | `POST /api/otp/send` · `POST /api/otp/verify`                                                                                                                                                                                                            |
| Notifications   | `POST /api/notifications`                                                                                                                                                                                                                                |
| Photo storage   | `POST /api/photos` (multipart, JPEG/PNG/WebP up to 5 MB, no video) · `GET /api/photos/:photoId`                                                                                                                                                          |

Authorize, capture, refund and payout batches require an `Idempotency-Key` header. Repeating a key returns the first result and never repeats the action; reusing it for a different request is a 409. Card data is never accepted, only the method name.

## Training controls (all five services)

| Call                                    | Does                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `GET /health`                           | Status of all five services with their failure modes                                                       |
| `GET /_training/<service>/health`       | One service's status                                                                                       |
| `GET /_training/<service>/inspect`      | Every request received (time, method, URL, body, status, outcome) and the service's stored state           |
| `POST /_training/<service>/reset`       | Clears stored state, request log and failure mode (`POST /_training/reset-all` for all)                    |
| `PUT /_training/<service>/failure-mode` | `{ "mode": "none" \| "down" \| "timeout" \| "decline" \| "ambiguous", "timeoutMs"? }`                      |
| `POST /_training/payouts/settle-now`    | Pays every queued payout now (otherwise they settle after one minute; `DUMMY_PAYOUT_SETTLE_MS` changes it) |

`<service>` is `payments`, `payouts`, `otp`, `notifications` or `photos`.

## Failure modes

- **down**: every call returns 503; nothing is done.
- **timeout**: the call hangs (30 s by default; `DUMMY_TIMEOUT_MS` or `timeoutMs` changes it), then returns 504; nothing is done.
- **decline**: payment authorize and capture return 402; other calls behave as `down`.
- **ambiguous**: the action **is performed** but the reply is replaced by a 504, so the caller must retry with the same idempotency key to learn the outcome.

## Demonstration

From the repository root, `bash scripts/dummy-curl-demo.sh | tee STEP-18-api-tests.txt` runs the workbook Step 18 sequence against a running service.
