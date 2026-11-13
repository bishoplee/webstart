import { NextResponse } from "next/server";
import { getIntegrationCapabilities } from "@/lib/env";

export async function GET() {
  const capabilities = getIntegrationCapabilities();
  return NextResponse.json({
    status: "ok",
    service: "webstart",
    timestamp: new Date().toISOString(),
    capabilities,
  });
}
