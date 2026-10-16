import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Credentials (change these via env vars in Vercel dashboard) ───────────────
const USERNAME = process.env.AUTH_USERNAME ?? 'admin';
const PASSWORD = process.env.AUTH_PASSWORD ?? 'leadflow123';

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    // Authorization: Basic <base64(username:password)>
    const [scheme, encoded] = authHeader.split(' ');

    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const [user, pass] = decoded.split(':');

      if (user === USERNAME && pass === PASSWORD) {
        // Valid credentials — let the request through
        return NextResponse.next();
      }
    }
  }

  // No / invalid credentials — challenge the browser
  return new Response('Unauthorized — please log in to view the LeadFlow Dashboard.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="LeadFlow Dashboard", charset="UTF-8"',
    },
  });
}

// ── Matcher: protect ALL frontend pages, but NEVER /api/* routes ──────────────
// The negative lookahead skips: api routes, Next.js internals, and static assets
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
};
