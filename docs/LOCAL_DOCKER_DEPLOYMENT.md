# China 1 Local Docker Deployment

This deployment is for the restaurant cashier laptop. It runs the order
website/admin screen and exactly one automatic receipt-print worker all day,
while Supabase remains the managed cloud database.

## Architecture

| Component | Docker service | Host port | Purpose |
| --- | --- | --- | --- |
| Next.js standalone server | `web` | `3000` | Storefront, admin page, and `/api/orders` |
| ESC/POS print worker | `print-bridge` | `3101` (localhost only) | Polls Supabase and writes receipts to the printer over TCP |
| Supabase | Not local | HTTPS outbound | Hosted order database and realtime events |

Both containers are on the private `restaurant` bridge network. No Docker
volume is needed today: order data is stored in Supabase, and the containers
are intentionally replaceable. Future Redis, kitchen-display, analytics, or
phone-order workers can join this same private network.

Both services use `restart: unless-stopped`, so they return after an
application crash and after Docker Desktop starts following a reboot. `init:
true` provides clean process termination when staff run `docker compose down`.

## Files Added

```text
Dockerfile                    Multi-stage production images for web and printing
docker-compose.yml            Local production orchestration and health checks
.dockerignore                 Keeps dependencies, builds, and secrets out of images
.env.example                  Safe configuration template
app/api/health/route.ts       Non-invasive Next.js health endpoint
start.command / stop.command  macOS double-click launchers
start.bat / stop.bat          Windows double-click launchers
```

The print bridge now serves `http://localhost:3101/health`. This reports its
last Supabase polling result and configured printer target; it does not connect
to or print on the receipt printer.

## One-Time Laptop Setup

1. Install Docker Desktop and enable **Start Docker Desktop when you sign in**.
2. Clone this repository onto the cashier laptop.
3. Create `.env.local` beside `docker-compose.yml` using `.env.example` as the
   template. Supply the real Supabase keys and a fixed IP address for the
   receipt printer.
4. Ensure the laptop and Ethernet/Wi-Fi receipt printer are on the same
   restaurant network and reserve the printer IP in the router.
5. Start the system:

   ```bash
   docker compose up -d
   ```

The real `.env.local` must be securely provided once on each new laptop; it
cannot be bundled in Git because it contains the Supabase service-role key.
After initial setup, staff only need the launch/stop scripts or the commands.

If code is updated later, rebuild and start:

```bash
docker compose up -d --build
```

## Daily Staff Operation

On macOS, double-click `start.command` at opening time and `stop.command` at
closing time. On Windows, double-click `start.bat` and `stop.bat`.

Equivalent commands are:

```bash
docker compose up -d
docker compose down
```

Open the cashier app at [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders).

## Environment Handling

At runtime, Compose supplies `.env.local` to both containers with `env_file`.
The web image also uses `.env.local` as a Docker build secret because Next.js
must compile `NEXT_PUBLIC_*` variables into browser JavaScript. The secret is
mounted only for the build command and is not copied into the image
filesystem.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is designed to be public. In contrast,
`SUPABASE_SERVICE_ROLE_KEY` is private and is only used by server-side code and
the worker.

Important existing security limitation: `NEXT_PUBLIC_ADMIN_PIN` is visible in
the browser bundle. This is acceptable only for a controlled local cashier
screen; before exposing the admin page to customers or the public internet,
replace that PIN gate with server-validated staff authentication.

## Printer Connectivity

### Recommended production configuration: network printer

Use an ESC/POS printer with Ethernet or Wi-Fi raw printing enabled:

```env
PRINTER_HOST=192.168.1.131
PRINTER_PORT=9100
```

The `print-bridge` container makes an outbound TCP connection from Docker
Desktop to that LAN address. Do not set `PRINTER_HOST=localhost`; inside a
container, `localhost` is the container itself.

For a printer exposed by software running on the laptop itself, use:

```env
PRINTER_HOST=host.docker.internal
PRINTER_PORT=9100
```

### USB printer limitation on Docker Desktop

Raw USB printer passthrough from Linux containers is not reliably supported by
Docker Desktop on macOS or Windows. This production Compose setup therefore
supports network/TCP ESC/POS printers, which are the dependable restaurant
deployment option.

If an existing printer is USB-only, use a small Ethernet print server that
exposes raw port `9100`, change to a network-capable receipt printer, or run
the print bridge directly on the host with an OS-specific USB implementation.
The current bridge writes TCP ESC/POS and does not implement USB drivers.

## Health And Verification

After first startup, run:

```bash
docker compose ps
curl http://localhost:3000/api/health
curl http://localhost:3101/health
docker compose logs --tail=50 print-bridge
```

Both services should show `healthy`; the JSON endpoints should report
`"status":"ok"`. Then verify the real workflow:

1. Load `http://localhost:3000/order` and submit a small test pickup order.
2. Confirm it appears at `http://localhost:3000/admin/orders`.
3. Confirm one receipt prints and the order changes to printed.
4. Inspect `docker compose logs --tail=50 print-bridge` for the printed order
   confirmation.
5. Stop and restart with `docker compose down` and `docker compose up -d`;
   confirm both health endpoints return successfully again.

The health check intentionally does not open a printer socket, so a real test
order is required to verify paper, cutter, character encoding, and the printer
network path. For an intentional sample receipt test from a
Docker-equipped laptop, run:

```bash
docker compose exec print-bridge npm run print-test
```

## Docker Desktop Settings

For both macOS and Windows:

- Turn on Docker Desktop startup at sign-in.
- Allocate at least 2 GB memory and 2 CPUs; these two lightweight services do
  not require a large Docker VM.
- Prevent the cashier laptop from sleeping during store hours, or printing and
  the admin display will stop while it sleeps.
- Permit Docker Desktop through local firewall prompts so the web port and
  outbound printer connection function.

For Windows, use Linux containers (Docker Desktop's standard WSL 2 backend).
For macOS, no special virtualization setting is needed for a LAN printer.

## Optional Start At Machine Boot

First confirm manual startup and printing for a full shift.

- macOS: enable Docker Desktop login startup, then add `start.command` as a
  Login Item for the cashier account.
- Windows: enable Docker Desktop login startup, then add a shortcut to
  `start.bat` in the cashier account's Startup folder (`shell:startup`).

Because Docker Desktop itself may need a moment to finish launching,
auto-start is optional; the double-click launcher is the clearest fallback for
staff.

## Production Versus Development

Production on the cashier laptop uses:

```bash
docker compose up -d --build
```

It creates an optimized standalone Next server, uses restart policies, and
runs the dedicated print worker once.

For development, continue to run the app on the host for fast Next.js reloads:

```bash
npm install
npm run dev
```

Run `npm run print-bridge` only when actively testing automatic printing, and
never run both the host bridge and Docker `print-bridge` against live orders
at the same time or receipts may duplicate.

## Troubleshooting

| Symptom | Checks and resolution |
| --- | --- |
| `docker compose up` reports missing `.env.local` | Create the file from `.env.example` and add the restaurant credentials. |
| `web` is unhealthy | Run `docker compose logs web`; confirm all required `.env.local` values are present, then rebuild with `docker compose up -d --build`. |
| `print-bridge` repeatedly restarts | Run `docker compose logs print-bridge`; verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. |
| Orders appear but no receipt prints | Confirm `PRINTER_HOST` is a LAN IP, printer is powered on, raw TCP port `9100` is enabled, and the laptop is on the same network. |
| Printer target is `localhost` | Replace it with the printer IP or `host.docker.internal` for a host-side TCP print service. |
| Receipt prints twice | Stop any host-run bridge or second laptop bridge; only one worker may monitor live orders. |
| USB printer is not found | Docker Desktop is not a reliable raw USB path; use a TCP print server/network printer or a host-native bridge. |
| Chinese text is garbled | Confirm the printer supports the configured GB18030/Chinese code page; printer firmware/code-page setup may need adjustment. |

For a clean refresh after application changes:

```bash
docker compose down
docker compose up -d --build
```

## Future Services

The Compose boundary is ready for new isolated workers without changing the
cashier operation model. A kitchen display can consume Supabase/realtime
events; Redis can be introduced with a persistent volume when queues are
needed; analytics and AI phone-order workers can be added behind private
service-to-service networking; and printer-specific worker instances can use
separate printer targets and explicit routing rules.
