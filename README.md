# China 1 Website

Modern pickup-ordering website for China 1 Chinese Food Take Out.

## Supabase Setup

Add these variables to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PIN=1234
```

Optional future variables already scaffolded in `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=
THERMAL_PRINTER_HOST=
THERMAL_PRINTER_PORT=9100
```

Run the SQL in [supabase/orders.sql](./supabase/orders.sql) in the Supabase SQL editor. It creates:

- `orders`
- `order_items`
- basic MVP RLS policies for anonymous pickup order insert/read/update
- realtime publication entries for the admin order board

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

## Printer Integration TODO

Do not connect the thermal printer directly from the website. The future local print bridge should:

- watch new orders from Supabase
- send ESC/POS receipt commands to the Ethernet printer IP on port `9100`
- mark the order as `printed=true`
- support manual reprint

No POS integration is currently implemented.
