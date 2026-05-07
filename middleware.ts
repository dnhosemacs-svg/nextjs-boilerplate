import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ["/tasks/:path*", "/stats/:path*", "/api/tasks/:path*", "/login"],
};
