import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const requiredConfiguration = [
    "NEXT_PUBLIC_ADMIN_PIN",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_URL",
  ];
  const missingConfiguration = requiredConfiguration.filter(
    (name) => !process.env[name],
  );
  const configured = missingConfiguration.length === 0;

  return NextResponse.json({
    service: "china1-web",
    status: configured ? "ok" : "configuration-error",
    missingConfiguration,
  }, { status: configured ? 200 : 503 });
}
