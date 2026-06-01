Stripe billing setup

1. Env variables (add to .env):

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
CASHIER_CURRENCY=eur

2. Cashier setup

composer require laravel/cashier
php artisan vendor:publish --provider="Laravel\\Cashier\\CashierServiceProvider"

3. Webhook

- In Stripe Dashboard, register endpoint: `https://your-host/api/stripe/webhook` and use the signing secret as `STRIPE_WEBHOOK_SECRET`.
- For local development use `ngrok` and forward to `/api/stripe/webhook`.

4. Training per-tenant models

Use:

```bash
php artisan kmeans:train {tenant_id}
```

This stores the model at `storage/app/tenants/{tenant_id}/model.pkl` and `perfumes.json` for the tenant.

5. Testing

Use Stripe test keys to simulate payments; no real charges are made.

6. Notes

- Stripe charges per transaction (merchant fees). Using test keys does not incur charges.
- Ensure `tenant()->stripe_id` is set when creating customers (handled in `BillingController`).
