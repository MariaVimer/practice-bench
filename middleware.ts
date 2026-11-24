import { NextResponse } from "next/server";

// Public site, kept out of search engines: noindex on every response.
export function middleware() {
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  return res;
}

export const config = { matcher: ["/:path*"] };
