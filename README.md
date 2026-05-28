# China 1 Website

Modern pickup-ordering website for China 1 Chinese Food Take Out.

## Cashier Laptop Docker Deployment

The local production deployment runs the Next.js app/API and the automatic
thermal print bridge as restartable Docker services:

```bash
docker compose up -d
```

Stop the system cleanly with:

```bash
docker compose down
```

See [docs/LOCAL_DOCKER_DEPLOYMENT.md](./docs/LOCAL_DOCKER_DEPLOYMENT.md) for
laptop setup, double-click startup scripts, Docker Desktop settings, network
printer configuration, auto-start, verification, and troubleshooting.

## Supabase Setup

Add these variables to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PIN=1234
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Printer bridge variables:

```env
PRINTER_HOST=192.168.1.131
PRINTER_PORT=9100
```

Run the SQL in [supabase/orders.sql](./supabase/orders.sql) in the Supabase SQL editor. It creates:

- `orders`
- `order_items`
- basic MVP RLS policies for anonymous pickup order insert/read/update
- realtime publication entries for the admin order board

If your database already has `order_items`, rerun the SQL or run this size
selection migration:

```sql
alter table public.order_items
  add column if not exists selected_price_id text,
  add column if not exists selected_price_label text,
  add column if not exists selected_price text,
  add column if not exists modifiers jsonb not null default '[]'::jsonb;
```

The current admin page uses a simple client-side PIN gate for MVP testing. Replace it with real staff auth before using it publicly.

## Testing Online Orders

1. Start the app with `npm run dev`.
2. Open `/admin/orders` in one browser window.
3. Open `/order` in another browser or private window.
4. Add items to the cart and go to `/checkout`.
5. Enter name, phone, pickup time, payment method, and submit.
6. Confirm the order appears in `/admin/orders` newest first.
7. Change the order status and confirm it updates.
8. Use `Print Receipt` or `Reprint` to test the browser print receipt.

## Printer Integration

Do not connect the thermal printer directly from the website or Vercel. The
local print bridge runs on one restaurant computer inside the China 1 network.

Add these variables to that local computer's environment:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PRINTER_HOST=192.168.1.131
PRINTER_PORT=9100
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.

Run a manual test print:

```bash
npm run print-test
```

Run the automatic bridge:

```bash
npm run print-bridge
```

The bridge:

- watches new orders from Supabase
- polls for `printed=false` orders
- sends ESC/POS receipt commands to `PRINTER_HOST:PRINTER_PORT`
- marks the order as `printed=true` only after the printer write succeeds
- leaves failed prints as `printed=false` so staff can retry

Only run the bridge on one restaurant computer at a time to avoid duplicate
printing. It keeps an in-process set of order IDs currently printing to prevent
duplicate auto-prints from overlapping poll cycles.

No POS integration is currently implemented.
