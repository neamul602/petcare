#!/usr/bin/env bash
# Workbook Step 18 demonstration: exercises every Dummy API and failure mode with curl.
# Usage: start the Dummy service (npm run dev -w @petcare/dummy-services), then
#        bash scripts/dummy-curl-demo.sh | tee STEP-18-api-tests.txt
set -u
B="${DUMMY_URL:-http://localhost:4100}"
J='content-type: application/json'
say() { printf '\n== %s\n' "$*"; }
req() { curl -s -w '  [HTTP %{http_code}]\n' "$@"; }
mode() { curl -s -X PUT "$B/_training/$1/failure-mode" -H "$J" -d "{\"mode\":\"$2\",\"timeoutMs\":${3:-200}}" >/dev/null; }

say "Reset all services"; req -X POST "$B/_training/reset-all"

say "OTP: send, read the code from inspection, verify"
req -X POST "$B/api/otp/send" -H "$J" -d '{"phone":"+8801712345678"}'
CODE=$(curl -s "$B/_training/otp/inspect" | python3 -c "import sys,json;print(json.load(sys.stdin)['state']['challenges'][0]['code'])")
req -X POST "$B/api/otp/verify" -H "$J" -d '{"phone":"+8801712345678","code":"000000"}'
req -X POST "$B/api/otp/verify" -H "$J" -d "{\"phone\":\"+8801712345678\",\"code\":\"$CODE\"}"

say "Payments: authorize BDT 20,000 with bKash (nothing captured yet)"
req -X POST "$B/api/payments/authorizations" -H "$J" -H 'Idempotency-Key: demo-auth-1' -d '{"method":"bkash","amount":2000000,"bookingRef":"BK-DEMO-1"}'
say "Capture twice with the same key: one charge"
req -X POST "$B/api/payments/authorizations/auth_0001/capture" -H 'Idempotency-Key: demo-cap-1'
req -X POST "$B/api/payments/authorizations/auth_0001/capture" -H 'Idempotency-Key: demo-cap-1'
say "Capture with a different key is refused"
req -X POST "$B/api/payments/authorizations/auth_0001/capture" -H 'Idempotency-Key: demo-cap-2'
say "Partial refund then over-refund"
req -X POST "$B/api/payments/pay_0001/refunds" -H "$J" -H 'Idempotency-Key: demo-ref-1' -d '{"amount":500000,"reason":"training"}'
req -X POST "$B/api/payments/pay_0001/refunds" -H "$J" -H 'Idempotency-Key: demo-ref-2' -d '{"amount":9999999}'

say "Failure mode DOWN"; mode payments down
req -X POST "$B/api/payments/authorizations" -H "$J" -H 'Idempotency-Key: demo-down' -d '{"method":"nagad","amount":100000}'
say "Failure mode DECLINE"; mode payments decline
req -X POST "$B/api/payments/authorizations" -H "$J" -H 'Idempotency-Key: demo-decl' -d '{"method":"card","amount":100000}'
say "Failure mode TIMEOUT (200 ms here; 30 s by default)"; mode payments timeout 200
req -X POST "$B/api/payments/authorizations" -H "$J" -H 'Idempotency-Key: demo-to' -d '{"method":"nagad","amount":100000}'
say "Failure mode AMBIGUOUS: action done, reply lost, retry returns the same result"; mode payments ambiguous
req -X POST "$B/api/payments/authorizations" -H "$J" -H 'Idempotency-Key: demo-amb' -d '{"method":"nagad","amount":300000}'
mode payments none
req -X POST "$B/api/payments/authorizations" -H "$J" -H 'Idempotency-Key: demo-amb' -d '{"method":"nagad","amount":300000}'
echo "  authorizations stored (expect 2):" "$(curl -s "$B/_training/payments/inspect" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['state']['authorizations']))")"

say "Payouts: batch sent twice with one key, freeze, release, settle"
BATCH='{"batchRef":"WK-1","lines":[{"bookingRef":"BK-DEMO-1","providerRef":"rashid","amount":1800000}]}'
req -X POST "$B/api/payouts/batches" -H "$J" -H 'Idempotency-Key: demo-batch-1' -d "$BATCH"
req -X POST "$B/api/payouts/batches" -H "$J" -H 'Idempotency-Key: demo-batch-1' -d "$BATCH"
req -X POST "$B/api/payouts/po_0001/freeze"
req -X POST "$B/api/payouts/po_0001/release"
req -X POST "$B/_training/payouts/settle-now"
req "$B/api/payouts/po_0001"
req -X POST "$B/api/payouts/po_0001/freeze"

say "Notifications"
req -X POST "$B/api/notifications" -H "$J" -d '{"recipient":"+8801712345678","role":"owner","language":"bn","type":"booking.confirmed","body":"Rashid confirmed Tito stay","bookingRef":"BK-DEMO-1"}'

say "Photos: upload a PNG, fetch it, reject a text file"
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR' > /tmp/petcare-demo.png
printf 'not an image' > /tmp/petcare-demo.txt
req -X POST "$B/api/photos" -F 'file=@/tmp/petcare-demo.png;type=image/png' -F 'bookingRef=BK-DEMO-1'
curl -s -o /dev/null -w '  GET photo_0001 -> HTTP %{http_code}, %{content_type}\n' "$B/api/photos/photo_0001"
req -X POST "$B/api/photos" -F 'file=@/tmp/petcare-demo.txt;type=image/png'
say "Photo TIMEOUT"; mode photos timeout 200
req -X POST "$B/api/photos" -F 'file=@/tmp/petcare-demo.png;type=image/png'
mode photos none

say "Health of all five services"; req "$B/health"
